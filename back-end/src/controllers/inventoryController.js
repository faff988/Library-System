const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

//GET /api/books
exports.getInventory = async (req, res) => {
    try{
        const {search, category, status, page =1,limit =10} = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        //filter to match prisma schema
        let whereClause ={};
        if(search){
            whereClause.OR = [
                {title: {contains: search}},
                {author: {contains:search}},
                {dewey_code:{contains: search}}
            ];
        }

        //handle category dropdown
        if(category && category !== 'All Categories'){
            whereClause.section = category;
        }

        //handle availability status filter
        if(status && status !== 'All Status'){
            if(status === 'AVAILABLE'){
                whereClause.available_copies = {gt:0};
            } else if (status === 'OUT OF STOCK'){
                whereClause.available_copies = {equals:0};
            } else if(status === 'LOW STOCK'){
                whereClause.available_copies = {lte:2, gt:0};
            }
        }

        //fetch count to update frontend page number
        const totalCount = await prisma.books.count({where : whereClause});
        
        const rawBooks = await prisma.books.findMany({
            where: whereClause,
            skip: skip,
            take: parseInt(limit),
            orderBy: {title: 'asc'},
            include:{
                borrow_records: {
                    take:3,
                    orderBy:{borrow_date: 'desc'},
                    include:{members: true}
                }
            }
        });

        //format payload field to map frontend view
        const formattedBooks = rawBooks.map(book => {
            let resolvedStatus = "AVAILABLE";
            if(book.available_copies === 0) resolvedStatus = "OUT OF STOCK";
            else if(book.available_copies <=2) resolvedStatus = "LOW STOCK";

            return{
                id:String(book.book_id).padStart(4, '0'),
                rawId: book.book_id,
                title: book.title,
                author: book.author,
                deweyCode: book.dewey_code,
                sectionCode: book.section,
                available: book.available_copies || 0,
                totalCopies: book.total_copies || 0,
                borrowable: book.is_borrowable ?? true,
                status: resolvedStatus,
                addedDate: book.added_at ? new Date(book.added_at).toLocaleDateString() : '',
                history: book.borrow_records.map(record => ({
                    name: record.members?.full_name || 'Unknown Member',
                    borrowed: record.borrow_date ? new Date(record.borrow_date).toLocaleDateString() : '',
                    returned: record.return_date ? new Date(record.return_date).toLocaleDateString(): 'Active'
                }))
        };
    });

    const totalAggregated = await prisma.books.aggregate({
        _sum: {
            total_copies: true,
            available_copies: true
        }
    });

    res.json({
        books: formattedBooks,
        pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1,
            currentPage: parseInt(page)
        },
        stats: {
            totalBooks: totalAggregated._sum.total_copies || 0,
            available: totalAggregated._sum.available_copies || 0,
            borrowed: (totalAggregated._sum.total_copies || 0) - (totalAggregated._sum.available_copies || 0)
        }
    });
} catch (err) {
    res.status(500).json({error: 'Failed to fetch inventory', details: err.message});
}

//GET API/BOOK/:ID SINGLE BOOK
exports.getBookById = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const book = await prisma.books.findUnique({
            where: { book_id: bookId },
            include: {
                borrow_records: {
                    take: 3,
                    orderBy: { borrow_date: 'desc' },
                    include: { members: true }
                }
            }
        });

        if (!book) return res.status(404).json({ error: 'Book not found' });

        let resolvedStatus = "AVAILABLE";
        if (book.available_copies === 0) resolvedStatus = "OUT OF STOCK";
        else if (book.available_copies <= 2) resolvedStatus = "LOW STOCK";

        res.json({
            id: String(book.book_id).padStart(4, '0'),
            rawId: book.book_id,
            title: book.title,
            author: book.author,
            deweyCode: book.dewey_code,
            sectionCode: book.section,
            totalCopies: book.total_copies || 0,
            available: book.available_copies || 0,
            borrowed: (book.total_copies || 0) - (book.available_copies || 0),
            borrowable: book.is_borrowable ?? true,
            status: resolvedStatus,
            addedDate: book.added_at ? new Date(book.added_at).toLocaleDateString() : '',
            history: book.borrow_records.map(record => ({
                name: record.members?.full_name || 'Unknown Member',
                borrowed: record.borrow_date ? new Date(record.borrow_date).toLocaleDateString() : '',
                returned: record.return_date ? new Date(record.return_date).toLocaleDateString() : 'Active'
            }))
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch book', details: err.message });
    }
};

    //POST /api/books create a brand new catalog record
    exports.createBook = async (req, res) => {
        try{
            const {title, author, deweyCode, sectionCode, totalCopies, borrowable} = req.body;
            const cleanCopies = parseInt(totalCopies) || 1;
            const newBook = await prisma.books.create({
                data:{
                    title,
                    author,
                    dewey_code: deweyCode,
                    section: sectionCode,
                    total_copies: cleanCopies,
                    available_copies: cleanCopies,
                    is_borrowable: borrowable !== undefined ? borrowable : true
                }
            });
            res.status(201).json({message: 'Book created successfully', item: newBook});
        } catch (err) {
            res.status(400).json({error: 'Failed to create book', details: err.message});
        }
    };

    //PUT /api/books/:id
    exports.updateBook = async (req,res) => {
        try{
            const bookId = parseInt(req.params.id);
            const {title, author, deweyCode, sectionCode, totalCopies, borrowable} = req.body;

            const existing = await prisma.books.findUnique({
                where: {book_id: bookId}
            });
            if(!existing) return res.status(404).json({error: 'Book not found'});

            //recalculate available copies
            const newTotal = totalCopies != undefined ? parseInt(totalCopies) : existing.total_copies;
            const diff = newTotal - (existing.total_copies || 0);
            const newAvailable = Math.max(0, (existing.available_copies || 0) + diff);

            const updated = await prisma.books.update({
                where: {book_id: bookId},
                data: {
                    title: title || existing.title,
                    author: author || existing.author,
                    dewey_code: deweyCode || existing.dewey_code,
                    section: sectionCode || existing.section,
                    total_copies: newTotal,
                    available_copies: newAvailable,
                    is_borrowable: borrowable !== undefined ? borrowable : existing.is_borrowable
                }
            });

            res.json({message: 'Book updated successfully', item: updated});
        } catch (err) {
            res.status(400).json({error: 'Failed to update book', details: err.message});
        }
    };

    exports.deleteBook = async(req, res) => {
        try{
            const bookId = parseInt(req.params.id);
            await prisma.books.delete({
                where: {book_id: bookId}
            });
            res.json({message: 'Book deleted successfully'});
        } catch (err) {
            res.status(400).json({error: 'Failed to delete book', details: err.message});
        }
    };
}