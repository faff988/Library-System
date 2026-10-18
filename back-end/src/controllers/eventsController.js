// controllers/eventsController.js
const prisma = require('../lib/prisma');
const { deleteStoredImage, imageUrl } = require('../utils/imageStorage');

// Must match the `events_event_category` enum in schema.prisma
const EVENT_CATEGORIES = ['discussion', 'special', 'children', 'workshop'];

// event_time is stored as a MySQL TIME via Prisma's DateTime + @db.Time(0),
// which Prisma represents using the epoch date (1970-01-01). Accepts "HH:MM"
// or "HH:MM:SS" from the client and returns a Date Prisma can write to a
// Time column. Returns null for anything unparseable.
function parseTimeInput(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const [, hh, mm, ss = '00'] = match;
  const h = Number(hh);
  const m = Number(mm);
  const s = Number(ss);
  if (h > 23 || m > 59 || s > 59) return null;
  return new Date(Date.UTC(1970, 0, 1, h, m, s));
}

// event_date is a plain Date (no time component). Accepts "YYYY-MM-DD".
function parseDateInput(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function serializeEvent(event) {
  return {
    ...event,
    event_image_url: imageUrl(event.event_image, 'events'),
    is_past: new Date(event.event_date) < new Date(new Date().toDateString()),
  };
}

// The admin form (EventsPage.jsx) posts FormData with keys: title, category,
// description, date, time, maxAttendance, location, eventImage (file),
// removeImage. Older/direct API callers may still send the raw column
// names (event_title, event_category, ...), so both are accepted here.
function pickField(body, shortName, longName) {
  if (body[shortName] !== undefined) return body[shortName];
  return body[longName];
}

// GET /api/events
const list = async (req, res) => {
  try {
    const { category } = req.query;

    const where = {
      ...(category && EVENT_CATEGORIES.includes(category) ? { event_category: category } : {}),
    };

    const rows = await prisma.events.findMany({
      where,
      orderBy: { event_date: 'asc' },
    });

    const data = rows.map(serializeEvent);
    // `events` kept for the public site (Event.jsx uses res.data.events);
    // `success`/`data` added for the admin panel (EventsPage.jsx uses
    // response.data.success / response.data.data).
    return res.json({ success: true, events: data, data });
  } catch (err) {
    console.error('Error listing events:', err);
    return res.status(500).json({ error: 'Failed to load events.' });
  }
};

// GET /api/events/:id
const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid event id.' });

    const event = await prisma.events.findUnique({ where: { event_id: id } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const serialized = serializeEvent(event);
    return res.json({ success: true, event: serialized, data: serialized });
  } catch (err) {
    console.error('Error fetching event:', err);
    return res.status(500).json({ error: 'Failed to load this event.' });
  }
};

// POST /api/events  (multipart/form-data, field "eventImage" for the file)
const create = async (req, res) => {
  const event_title = pickField(req.body, 'title', 'event_title');
  const event_category = pickField(req.body, 'category', 'event_category');
  const description = pickField(req.body, 'description', 'description');
  const event_date = pickField(req.body, 'date', 'event_date');
  const event_time = pickField(req.body, 'time', 'event_time');
  const max_attendance = pickField(req.body, 'maxAttendance', 'max_attendance');
  const location = pickField(req.body, 'location', 'location');

  // If validation fails after the image was already uploaded to Cloudinary,
  // remove it again so no orphaned image is left behind.
  const reject = (status, error) => {
    if (req.file) deleteStoredImage(req.file.filename, 'events');
    return res.status(status).json({ error });
  };

  if (!event_title || !event_title.trim()) {
    return reject(400, 'Event title is required.');
  }
  if (!EVENT_CATEGORIES.includes(event_category)) {
    return reject(400, `Category must be one of: ${EVENT_CATEGORIES.join(', ')}`);
  }
  const parsedDate = parseDateInput(event_date);
  if (!parsedDate) {
    return reject(400, 'A valid event_date (YYYY-MM-DD) is required.');
  }
  const parsedTime = parseTimeInput(event_time);
  if (!parsedTime) {
    return reject(400, 'A valid event_time (HH:MM) is required.');
  }
  let attendance = null;
  if (max_attendance !== undefined && max_attendance !== null && max_attendance !== '') {
    attendance = Number(max_attendance);
    if (!Number.isInteger(attendance) || attendance < 0) {
      return reject(400, 'max_attendance must be a non-negative integer.');
    }
  }

  try {
    const newEvent = await prisma.events.create({
      data: {
        event_title: event_title.trim(),
        event_category,
        description: description || null,
        event_date: parsedDate,
        event_time: parsedTime,
        max_attendance: attendance,
        location: location ? String(location).trim() : null,
        // multer + the Cloudinary step in middleware/upload.js put the full
        // image URL on req.file.filename.
        event_image: req.file ? req.file.filename : null,
      },
    });

    const serialized = serializeEvent(newEvent);
    return res.status(201).json({
      success: true,
      message: 'Event created.',
      event: serialized,
      data: serialized,
    });
  } catch (err) {
    console.error('Error creating event:', err);
    if (req.file) deleteStoredImage(req.file.filename, 'events');
    return res.status(500).json({ error: 'Failed to create this event.' });
  }
};

// PUT /api/events/:id  (multipart/form-data, field "eventImage" for a replacement file)
const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      if (req.file) deleteStoredImage(req.file.filename, 'events');
      return res.status(400).json({ error: 'Invalid event id.' });
    }

    const existing = await prisma.events.findUnique({ where: { event_id: id } });
    if (!existing) {
      if (req.file) deleteStoredImage(req.file.filename, 'events');
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event_title = pickField(req.body, 'title', 'event_title');
    const event_category = pickField(req.body, 'category', 'event_category');
    const description = pickField(req.body, 'description', 'description');
    const event_date = pickField(req.body, 'date', 'event_date');
    const event_time = pickField(req.body, 'time', 'event_time');
    const max_attendance = pickField(req.body, 'maxAttendance', 'max_attendance');
    const removeImage = pickField(req.body, 'removeImage', 'removeImage');
    const location = pickField(req.body, 'location', 'location');

    const reject = (status, error) => {
      if (req.file) deleteStoredImage(req.file.filename, 'events');
      return res.status(status).json({ error });
    };

    if (event_category !== undefined && event_category !== '' && !EVENT_CATEGORIES.includes(event_category)) {
      return reject(400, `Category must be one of: ${EVENT_CATEGORIES.join(', ')}`);
    }

    const data = {
      ...(event_title !== undefined ? { event_title: event_title.trim() } : {}),
      ...(event_category !== undefined && event_category !== '' ? { event_category } : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(location !== undefined ? { location: location ? String(location).trim() : null } : {}),
    };

    if (event_date !== undefined) {
      const parsedDate = parseDateInput(event_date);
      if (!parsedDate) return reject(400, 'Invalid event_date.');
      data.event_date = parsedDate;
    }
    if (event_time !== undefined) {
      const parsedTime = parseTimeInput(event_time);
      if (!parsedTime) return reject(400, 'Invalid event_time.');
      data.event_time = parsedTime;
    }
    if (max_attendance !== undefined) {
      if (max_attendance === null || max_attendance === '') {
        data.max_attendance = null;
      } else {
        const attendance = Number(max_attendance);
        if (!Number.isInteger(attendance) || attendance < 0) {
          return reject(400, 'max_attendance must be a non-negative integer.');
        }
        data.max_attendance = attendance;
      }
    }

    // Image handling: a newly uploaded file wins; otherwise an explicit
    // removeImage="true" clears it; otherwise the existing image is left
    // untouched. Matches the pattern in booksController.update.
    let oldImageToDelete = null;
    if (req.file) {
      data.event_image = req.file.filename;
      if (existing.event_image) oldImageToDelete = existing.event_image;
    } else if (removeImage === 'true' && existing.event_image) {
      data.event_image = null;
      oldImageToDelete = existing.event_image;
    }

    const updated = await prisma.events.update({ where: { event_id: id }, data });

    if (oldImageToDelete) deleteStoredImage(oldImageToDelete, 'events');

    const serialized = serializeEvent(updated);
    return res.json({
      success: true,
      message: 'Event updated.',
      event: serialized,
      data: serialized,
    });
  } catch (err) {
    console.error('Error updating event:', err);
    if (req.file) deleteStoredImage(req.file.filename, 'events');
    return res.status(500).json({ error: 'Failed to update this event.' });
  }
};

// DELETE /api/events/:id
const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid event id.' });

    const existing = await prisma.events.findUnique({ where: { event_id: id } });
    if (!existing) return res.status(404).json({ error: 'Event not found.' });

    await prisma.events.delete({ where: { event_id: id } });

    if (existing.event_image) deleteStoredImage(existing.event_image, 'events');

    return res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    console.error('Error deleting event:', err);
    return res.status(500).json({ error: 'Failed to delete this event.' });
  }
};

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};