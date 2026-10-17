-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Oct 16, 2026 at 02:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sr_lib_test`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(150) NOT NULL,
  `publisher` varchar(150) DEFAULT NULL,
  `dewey_code` varchar(20) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `language` enum('Khmer','English','French') NOT NULL,
  `category` varchar(100) NOT NULL,
  `section` varchar(20) DEFAULT NULL,
  `publication_year` int(11) DEFAULT NULL,
  `total_copies` int(11) DEFAULT 1,
  `available_copies` int(11) DEFAULT 1,
  `is_borrowable` tinyint(1) DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `title`, `author`, `publisher`, `dewey_code`, `isbn`, `language`, `category`, `section`, `publication_year`, `total_copies`, `available_copies`, `is_borrowable`, `added_at`, `description`, `cover_image`) VALUES
(28, 'ខ្ញុំខុសគេ', 'សុទ្ធ បូជា', NULL, '858.9', NULL, 'Khmer', 'Literature', 'K1', 2026, 1, 1, 1, '2026-08-23 00:45:32', NULL, '1792083317203-536250791.jpg'),
(29, 'អ្នកជាមនុស្សស្នេហ៍ស្មោះបំផុត', 'ផ្សេន សុធា', NULL, '895.932', NULL, 'Khmer', 'Literature', 'K 1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(30, 'ក្មេងសាលាបារាំង', 'ជុត ខៃ', NULL, '895.9', NULL, 'Khmer', 'Literature', 'K 2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792083398112-433573413.jpg'),
(31, 'ដំណើរផ្សងព្រេងរបស់ម៉ៅឃ្លី', 'វ៉ាំងយ៉ាត ឃែបក្រឹង', NULL, '895.9', NULL, 'Khmer', 'Literature', 'K 2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792083522504-461678096.jpg'),
(32, 'សេនាធិ ក៏ជ័យសង្គ្រាម', 'ហ្វូ ស្រីមាស', NULL, '895.9', NULL, 'Khmer', 'Literature', 'K 3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(33, 'លោកប្តី', 'លោកប្តី', NULL, '895.9', NULL, 'Khmer', 'General', 'K3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(34, 'ថ្ងៃមនុស្សឃាត ថ្ងៃនេះស្រឡាញ់', 'ម៉ឺន សុធារី', NULL, '895.9', NULL, 'Khmer', 'General', 'K 4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(35, 'បេសកកម្មមួយ', 'ម៉ាំង ម៉ានិត', NULL, '895.9', NULL, 'Khmer', 'General', 'K 4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(36, 'កងដែនជេន', 'ឃួន ធីតា', NULL, '895.9', NULL, 'Khmer', 'General', 'K 5', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(37, 'វិមានផ្កាចម្ប៉ា', 'ឃឹ​​ម វុត្ថា​ន', NULL, '895.9', NULL, 'Khmer', 'Literature', 'K 5', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084007468-478431790.jpg'),
(38, 'ខ្មោចបិសាច', 'ជិន ចាន់ថន', NULL, '398.25', NULL, 'Khmer', 'General', 'KK 1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(39, 'ខ្មោចចង់ស៊ីសាំងវ៉ិច', 'ឌឹម ដន', NULL, '398.25', NULL, 'Khmer', 'Social Sciences', 'KK 1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792083982929-915449153.jpg'),
(40, 'រឿង អារក្ស', 'ពេជ្រ ជ្រៀង', NULL, '398', NULL, 'Khmer', 'General', 'KK 2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(41, 'ប្រេតមាត់ស្ជុយ', 'គឹមស៊ីន សុធារី', NULL, '398.2', NULL, 'Khmer', 'General', 'KK 2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(42, 'ស្លាប់ និទានខ្មោច', 'ប៊ុន នាង', NULL, '398.25', NULL, 'Khmer', 'Social Sciences', 'KK 3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(43, 'អ្នកតារក្សាមេដ', 'គង់ សុខគាង', NULL, '398.25', NULL, 'Khmer', 'Social Sciences', 'KK 3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(44, 'ខ្មោចលងបះសក់', 'ឌឹម មិន', NULL, '398.25', NULL, 'Khmer', 'General', 'KK 4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(45, 'មេខ្មោចក្នុងភូមិ', 'វ៉ាន់ សុភ័ក្ត្រ', NULL, '398.25', NULL, 'Khmer', 'General', 'KK 4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(46, 'ប្រាសាទបន្ទាយឆ្មារ', 'គឹមស៊ីន សុធារី', NULL, '398.2', NULL, 'Khmer', 'Social Sciences', 'KK 5', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792083955429-181793896.jpg'),
(47, 'ភ្នំប្រុស ភ្នំស្រី', 'គឹមស៊ីន សុធារី', NULL, '398.2', NULL, 'Khmer', 'Social Sciences', 'KK 5', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792083940809-823019848.jpg'),
(48, 'Impossible crush Try not to laugh', 'Dara Ly', NULL, '100', NULL, 'English', 'Philosophy & Psychology', 'E1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(49, 'A proper woman', 'Thavry Thon', NULL, '959.6', NULL, 'English', 'History & Geography', 'E1', NULL, 1, 0, 1, '2026-08-23 07:47:44', NULL, '1792076412583-841542837.jpg'),
(50, 'Kiss Cam', 'Kiara London', NULL, '813.6', NULL, 'English', 'Literature', 'E2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792083927223-276065990.jpg'),
(51, 'Hector And the Secrets of Love', 'Francois Lelord', NULL, '843.92', NULL, 'English', 'Literature', 'E2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084054505-708001989.jpg'),
(52, 'Diary of a Wimpy kid Double Down', 'Jeff kinney', NULL, '813.6', NULL, 'English', 'Literature', 'E3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084072957-832376135.jpg'),
(53, 'The story of English in 100 words', 'David Crystal', NULL, '422', NULL, 'English', 'Language', 'E3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084093987-783850033.jpg'),
(54, 'The Horse and His boy', 'C.S lewis Ronicles of Narnia', NULL, '813', NULL, 'English', 'Literature', 'E4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084114356-449419788.jpg'),
(55, 'The silver Chair', 'C.S lewis Ronicles of Narnia', NULL, '813', NULL, 'English', 'Literature', 'E4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084131329-121123152.jpg'),
(56, 'Black', 'Kaly KAO', NULL, '823.92', NULL, 'English', 'General', 'E5', NULL, 1, 0, 1, '2026-08-23 07:47:44', NULL, NULL),
(57, 'The House on Mango Street', 'Sandra Cisneros', NULL, '813.54', NULL, 'English', 'Literature', 'E5', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084147415-935871782.jpg'),
(58, 'Storybook Collection', 'Disney', NULL, '813', NULL, 'English', 'Literature', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084170811-429305865.jpg'),
(59, 'Storybook Collection', 'Disney', NULL, '813.6', NULL, 'English', 'General', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(60, 'Tangled', 'Disney', NULL, '813.6', NULL, 'English', 'Literature', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084186414-996306478.jpg'),
(61, 'Farm friends', 'Anna', NULL, '398.2', NULL, 'English', 'Social Sciences', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792084285308-902511413.jpg'),
(62, 'The tree little pigs', 'lambert', NULL, '398.2', NULL, 'English', 'General', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(63, 'Little Bear\'s big advanture', 'Julia', NULL, '823', NULL, 'English', 'General', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(64, 'I love my mommy', 'stephanie', NULL, '823', NULL, 'English', 'Literature', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(65, 'Aladdin', 'Autumn', NULL, '398', NULL, 'English', 'General', 'EK1', NULL, 1, 0, 1, '2026-08-23 07:47:44', NULL, NULL),
(66, 'little red riding hood', 'lambert', NULL, '398.2', NULL, 'English', 'General', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(67, 'The desert alphabet book', 'Mark', NULL, '574', NULL, 'English', 'General', 'EK1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(68, 'Guide to Home Plumbing', 'Robert W.Wood', NULL, '696.1', NULL, 'English', 'Technology', 'Inter01', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792072079519-66532864.jpg'),
(69, 'Winning at Work', 'Mel Sandler', NULL, '650.1', NULL, 'English', 'General', 'Inter01', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(70, 'Mad for Math ( Spy school the frsction mission )', 'Linda Berdla', NULL, '513', NULL, 'English', 'Science', 'Inter01', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(71, 'Croatie', 'Lonely planet', NULL, '914', NULL, 'English', 'History & Geography', 'Inter 02', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(72, 'Cambodia', 'Lonely planet', NULL, '915', NULL, 'English', 'History & Geography', 'Inter 02', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(73, 'New York', 'Hachette', NULL, '917', NULL, 'English', 'General', 'Inter 02', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(74, 'Le Prophete', 'Khalil Gibran', NULL, '892.75', NULL, 'French', 'General', 'Inter03', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(75, 'The new confessions of an economic hitman', 'John Perkins', NULL, '823', NULL, 'English', 'General', 'Inter03', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(76, 'SOUTH INDIAN DISHES', 'SAVITA GUPTA', NULL, '954', NULL, 'English', 'General', 'Inter 04', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(77, 'Le Cambodge en voix off', 'Funan', NULL, '808.81', NULL, 'French', 'General', 'Inter 04', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(78, 'Avant, pendant, aprés', 'Jean-Marc-Parisis', NULL, '843', NULL, 'French', 'Literature', 'F1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, '1792076599364-966553898.jpg'),
(79, 'Le monde des Ramses', 'Claire Lalouette', NULL, '932.01', NULL, 'French', 'General', 'F1', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(80, 'LES SEPT LOIS SPIRITUELLES DU YOGA', 'DEEPAK CHOPORA & DAVID SIMON', NULL, '613', NULL, 'French', 'General', 'F2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(81, 'VERS LA SOBRIÈTÈ HEUREUSE', 'PIERRE RABHI', NULL, '304', NULL, 'French', 'General', 'F2', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(82, 'DES AMIS DANS LA POLICE', 'Pierre Siniac', NULL, '398', NULL, 'French', 'Social Sciences', 'F3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(83, 'Remets ton slip, gondolier', 'SAN-Antonio', NULL, '843.914', NULL, 'French', 'General', 'F3', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(84, 'Macbett', 'Ionesco', NULL, '842.914', NULL, 'French', 'General', 'F4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(85, 'la Peau de chagrin', 'Honoré de Balzac', NULL, '843.7', NULL, 'French', 'Literature', 'F4', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(86, 'L extraordinaire voyage du fakir qui etait reste coince dans une armoire', 'Romain Puretolas', NULL, '843.92', NULL, 'French', 'Literature', 'F5', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(87, 'Poulets Grilles', 'Sophie Henaff', NULL, '843.92', NULL, 'French', 'General', 'F5', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(88, 'Le secret de la pyramide', 'Mary pope osborne', NULL, '823', NULL, 'French', 'General', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(89, 'Le voyage sur la lune', 'Mary Pope osborn', NULL, '823', NULL, 'French', 'General', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(90, 'La vallee des dinosaures', 'Mary Pope osborn', NULL, '823', NULL, 'French', 'Literature', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(91, 'le Mysterieux chevalier', 'Mary Pope osborn', NULL, '823', NULL, 'French', 'General', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(92, 'D\'où tu viens, Petit Chien ?', 'Mymi Doimet', NULL, '843.914', NULL, 'French', 'Literature', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(93, 'Le Chat botte', 'Charles Perrault', NULL, '843.0692', NULL, 'French', 'General', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(94, 'Course de chars à Olympie', 'Mary Pope Osborne', NULL, '823', NULL, 'French', 'Literature', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(95, 'Le terrible empereur de chine', 'Mary Pope Osborne', NULL, '823', NULL, 'French', 'General', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(96, 'Manon la fée des bonbons', 'Daisy Meadows', NULL, '823.92', NULL, 'French', 'General', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(97, 'Les aventures de Kimamila à la cantine', 'Anne Loyer', NULL, '843.92', NULL, 'French', 'General', 'FK', NULL, 1, 1, 1, '2026-08-23 07:47:44', NULL, NULL),
(98, 'GG', 'peter', NULL, '688', NULL, 'English', 'Technology', 'F2', NULL, 1, 1, 1, '2026-09-07 11:00:00', NULL, NULL),
(99, 'ABC', 'GG', NULL, '356', NULL, 'French', 'Social Sciences', 'E2', NULL, 1, 1, 1, '2026-09-07 11:00:44', NULL, NULL),
(100, 'Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', NULL, '823.9', NULL, 'English', 'Literature', 'E9', NULL, 1, 1, 1, '2026-09-07 11:00:51', NULL, NULL),
(101, 'Neang Neath', 'Bora', NULL, '568', NULL, 'Khmer', 'Science', 'K7', NULL, 1, 1, 1, '2026-09-07 23:31:16', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `borrow_records`
--

CREATE TABLE `borrow_records` (
  `borrow_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `issued_by` int(11) NOT NULL,
  `borrow_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `due_date` date NOT NULL,
  `return_date` timestamp NULL DEFAULT NULL,
  `status` enum('Borrowed','Returned','Overdue') DEFAULT 'Borrowed',
  `return_condition` enum('Good','Fair','Damaged') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_records`
--

INSERT INTO `borrow_records` (`borrow_id`, `member_id`, `book_id`, `issued_by`, `borrow_date`, `due_date`, `return_date`, `status`, `return_condition`) VALUES
(1, 1, 4, 1, '2026-07-25 02:03:44', '2026-08-08', '2026-07-25 09:03:56', 'Returned', NULL),
(2, 3, 2, 1, '2026-07-25 08:55:39', '2026-08-08', '2026-07-26 06:43:23', 'Returned', NULL),
(3, 4, 5, 1, '2026-07-25 12:41:14', '2026-08-09', '2026-07-26 06:43:27', 'Returned', NULL),
(4, 3, 6, 2, '2026-07-25 23:44:13', '2026-08-09', NULL, 'Overdue', NULL),
(5, 1, 25, 1, '2026-07-28 20:47:28', '2026-08-12', NULL, 'Overdue', NULL),
(6, 1, 12, 1, '2026-07-28 20:47:48', '2026-08-12', '2026-07-29 11:51:50', 'Returned', NULL),
(7, 1, 23, 1, '2026-07-28 20:47:59', '2026-08-12', NULL, 'Overdue', NULL),
(8, 3, 27, 2, '2026-07-29 04:51:16', '2026-08-12', NULL, 'Overdue', NULL),
(9, 5, 22, 3, '2026-08-10 22:00:36', '2026-08-25', '2026-08-11 18:49:40', 'Returned', 'Damaged'),
(10, 1, 26, 3, '2026-08-11 12:04:26', '2026-08-26', '2026-08-11 19:04:33', 'Returned', 'Damaged'),
(11, 4, 26, 3, '2026-08-16 20:36:06', '2026-08-31', '2026-08-17 03:36:10', 'Returned', 'Damaged'),
(12, 5, 22, 3, '2026-08-16 20:53:05', '2026-08-31', '2026-08-17 03:53:09', 'Returned', 'Damaged'),
(13, 4, 26, 3, '2026-08-16 20:57:51', '2026-08-31', '2026-08-17 03:57:54', 'Returned', 'Damaged'),
(14, 6, 26, 3, '2026-08-16 21:03:43', '2026-08-31', '2026-08-17 04:03:46', 'Returned', 'Damaged'),
(15, 1, 7, 3, '2026-08-16 21:04:23', '2026-08-31', '2026-08-17 04:04:26', 'Returned', 'Fair'),
(16, 3, 12, 3, '2026-08-16 21:04:36', '2026-08-31', '2026-08-17 04:04:40', 'Returned', 'Good'),
(17, 6, 26, 3, '2026-08-16 21:32:39', '2026-08-31', '2026-08-17 04:32:43', 'Returned', 'Damaged'),
(18, 3, 92, 3, '2026-08-23 01:06:56', '2026-09-06', '2026-08-23 08:07:27', 'Returned', 'Good'),
(19, 1, 56, 3, '2026-08-23 01:07:24', '2026-09-06', NULL, 'Overdue', NULL),
(20, 5, 49, 3, '2026-09-07 23:34:12', '2026-09-22', '2026-09-08 06:34:15', 'Returned', 'Good'),
(21, 3, 65, 3, '2026-09-07 23:34:58', '2026-09-22', '2026-09-08 06:52:11', 'Returned', 'Good'),
(22, 6, 99, 3, '2026-09-07 23:52:02', '2026-09-22', '2026-09-08 06:52:07', 'Returned', 'Good'),
(23, 5, 78, 3, '2026-10-15 01:08:11', '2026-10-29', '2026-10-15 08:08:24', 'Returned', 'Good'),
(24, 6, 78, 3, '2026-10-15 01:08:49', '2026-10-29', '2026-10-15 08:11:49', 'Returned', 'Damaged'),
(25, 4, 28, 6, '2026-10-15 01:36:40', '2026-10-29', '2026-10-15 08:36:59', 'Returned', 'Good'),
(26, 3, 65, 3, '2026-10-15 01:45:40', '2026-10-29', NULL, 'Borrowed', NULL),
(27, 5, 49, 3, '2026-10-15 08:03:31', '2026-10-29', NULL, 'Borrowed', NULL);

--
-- Triggers `borrow_records`
--
DELIMITER $$
CREATE TRIGGER `after_book_borrow` BEFORE INSERT ON `borrow_records` FOR EACH ROW BEGIN
    
    SET NEW.due_date = DATE_ADD(NOW(), INTERVAL 14 DAY);
    
    
    UPDATE books 
    SET available_copies = available_copies - 1 
    WHERE book_id = NEW.book_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_book_return` BEFORE UPDATE ON `borrow_records` FOR EACH ROW BEGIN
    
    IF NEW.status = 'Returned' AND OLD.status != 'Returned' THEN
        
        SET NEW.return_date = NOW();
        
        
        UPDATE books 
        SET available_copies = available_copies + 1 
        WHERE book_id = NEW.book_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `damage_reports`
--

CREATE TABLE `damage_reports` (
  `report_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `borrow_id` int(11) NOT NULL,
  `reported_by` int(11) NOT NULL,
  `book_condition` enum('Fair','Damaged','Lost') NOT NULL DEFAULT 'Damaged',
  `damage_description` text DEFAULT NULL,
  `reported_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `damage_reports`
--

INSERT INTO `damage_reports` (`report_id`, `book_id`, `borrow_id`, `reported_by`, `book_condition`, `damage_description`, `reported_at`) VALUES
(1, 26, 14, 3, 'Damaged', NULL, '2026-08-16 21:03:46'),
(2, 7, 15, 3, 'Fair', NULL, '2026-08-16 21:04:26'),
(3, 26, 17, 3, 'Damaged', NULL, '2026-08-16 21:32:43'),
(4, 78, 24, 3, 'Damaged', NULL, '2026-10-15 01:11:49');

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `donation_id` int(11) NOT NULL,
  `donor_name` varchar(150) DEFAULT 'Anonymous',
  `amount` decimal(10,2) DEFAULT NULL,
  `received_by` int(11) NOT NULL,
  `donation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `filed_to_inventory` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`donation_id`, `donor_name`, `amount`, `received_by`, `donation_date`, `filed_to_inventory`) VALUES
(1, 'Ty', NULL, 2, '2026-07-27 17:00:00', 0),
(8, 'Flin', NULL, 2, '2026-07-27 17:00:00', 0),
(10, 'Flin', NULL, 2, '2026-07-27 17:00:00', 0),
(34, 'Stacy', NULL, 2, '2026-07-28 17:00:00', 0),
(35, 'Stacy', NULL, 2, '2026-07-28 17:00:00', 0),
(36, 'Stacy', NULL, 2, '2026-07-28 17:00:00', 0),
(37, 'Ali', NULL, 2, '2026-07-28 17:00:00', 0),
(38, 'Ben', 50.00, 2, '2026-07-28 17:00:00', 0),
(39, 'Andres', NULL, 2, '2026-07-28 17:00:00', 0),
(40, 'Ceco;', NULL, 2, '2026-07-28 17:00:00', 0),
(41, 'Kairo', NULL, 2, '2026-07-28 17:00:00', 0),
(42, 'Shane', NULL, 2, '2026-07-28 17:00:00', 0),
(43, 'Steven', NULL, 1, '2026-07-28 17:00:00', 0),
(44, 'Sally', NULL, 2, '2026-07-28 17:00:00', 1),
(47, 'Chan Tevy', 3.00, 3, '2026-08-11 17:00:00', 1),
(48, 'Abby', NULL, 3, '2026-09-02 17:00:00', 1),
(49, 'dd', NULL, 3, '2026-09-06 17:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `donation_items`
--

CREATE TABLE `donation_items` (
  `item_id` int(11) NOT NULL,
  `donation_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(150) NOT NULL,
  `dewey_code` varchar(20) NOT NULL,
  `section` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `donation_items`
--

INSERT INTO `donation_items` (`item_id`, `donation_id`, `title`, `author`, `dewey_code`, `section`) VALUES
(1, 34, 'Little School', 'Anderson', '708', 'F2'),
(2, 35, 'Little School', 'Anderson', '708', 'F2'),
(3, 36, 'Little School', 'Anderson', '708', 'F2'),
(4, 37, 'Home Alone', 'Elisa', '479', 'F2'),
(5, 38, 'The Little Mermaid', 'Henry', '789', 'EK2'),
(6, 38, 'Dangerous Journey', 'Wise', '577', 'E2'),
(7, 39, 'Genius boy', 'Montreal', '344', 'EK2'),
(8, 40, 'Boreas', 'Julias', '288', 'F1'),
(9, 41, 'Vampire ', 'Louisa', '890', 'E2'),
(10, 42, 'Lord of the Rings', 'Yves', '255', 'E3'),
(11, 43, 'Guide to Plants', 'Nami', '367', 'E5'),
(12, 43, 'Greek Methodology', 'Phillip', '853.3', 'E3'),
(13, 44, 'Neang Neath', 'Bora', '568', 'K7'),
(14, 47, 'Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', '823.9', 'E9'),
(15, 48, 'ABC', 'GG', '356', 'E2'),
(16, 49, 'GG', 'peter', '688', 'F2');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `event_title` varchar(255) NOT NULL,
  `event_category` enum('discussion','special','children','workshop') NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `max_attendance` int(11) DEFAULT NULL,
  `event_image` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `event_title`, `event_category`, `description`, `event_date`, `event_time`, `max_attendance`, `event_image`, `location`) VALUES
(1, 'Book Fair', 'discussion', 'Supporting local bookstores', '2026-07-13', '17:00:00', 900, NULL, NULL),
(2, 'Siem Reap Bannalay Festival', 'special', 'To celebrate Siem Reap Bannalay 4th anniversary', '2026-08-17', '09:00:00', 200, '1786413539203-90781916.jpg', 'The Royal Garden');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `source` enum('book','event','general') NOT NULL,
  `comment` text NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `feedback_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','replied') DEFAULT 'pending',
  `admin_reply` text DEFAULT NULL,
  `book_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`feedback_id`, `user_name`, `email`, `source`, `comment`, `rating`, `feedback_date`, `status`, `admin_reply`, `book_id`) VALUES
(1, 'fina', 'fina@gmail.com', 'general', 'good ui', 5, '2026-07-28 22:52:07', 'pending', NULL, NULL),
(2, 'nemo', 'nemo@gmail.com', 'book', 'I need purple diary', 5, '2026-07-28 23:29:38', 'replied', 'Thank you for your feedback! We will look into this matter and make the necessary improvements soon.', NULL),
(3, 'sokha', 'sokha@gmail.com', 'book', 'i want more greek myth books plzz', 4, '2026-07-29 04:47:17', 'pending', NULL, NULL);

--
-- Triggers `feedback`
--
DELIMITER $$
CREATE TRIGGER `after_feedback_insert` AFTER INSERT ON `feedback` FOR EACH ROW BEGIN
    
    IF NEW.`user_name` = 'Anonymous' THEN
        UPDATE `feedback` 
        SET `user_name` = CONCAT('Anonymous', NEW.`feedback_id`) 
        WHERE `feedback_id` = NEW.`feedback_id`;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_feedback_insert` BEFORE INSERT ON `feedback` FOR EACH ROW BEGIN
    
    IF NEW.`user_name` IS NULL OR NEW.`user_name` = '' THEN
        SET NEW.`user_name` = 'Anonymous';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `library_entries`
--

CREATE TABLE `library_entries` (
  `entry_id` int(11) NOT NULL,
  `attendee_name` varchar(150) NOT NULL,
  `age` int(11) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `purpose` enum('Research','Study','Reading','Event','Other') DEFAULT NULL,
  `entry_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `library_entries`
--

INSERT INTO `library_entries` (`entry_id`, `attendee_name`, `age`, `address`, `phone_number`, `purpose`, `entry_time`) VALUES
(1, 'abc abc', 0, NULL, '078 337 443', 'Research', '2026-07-29 00:00:57'),
(2, 'នៅ រដ្ឋា', 18, NULL, '023 034 473', 'Reading', '2026-07-29 00:01:49'),
(3, 'Heng Sa', 13, NULL, '045777666', 'Reading', '2026-07-29 04:50:37'),
(4, 'abc abc', 0, NULL, '078 337 443', 'Study', '2026-08-23 01:08:07');

-- --------------------------------------------------------

--
-- Table structure for table `library_settings`
--

CREATE TABLE `library_settings` (
  `setting_id` int(11) NOT NULL DEFAULT 1,
  `max_books_per_member` int(11) NOT NULL DEFAULT 2,
  `borrow_duration_days` int(11) NOT NULL DEFAULT 14,
  `renewal_limit` int(11) NOT NULL DEFAULT 2,
  `fine_per_day` decimal(6,2) NOT NULL DEFAULT 0.25,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `library_settings`
--

INSERT INTO `library_settings` (`setting_id`, `max_books_per_member`, `borrow_duration_days`, `renewal_limit`, `fine_per_day`, `updated_at`) VALUES
(1, 2, 14, 2, 0.25, '2026-08-05 20:36:19');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `member_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `date_of_birth` date NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `membership_type_id` int(11) DEFAULT NULL,
  `status` enum('Active','Suspended','Expired') DEFAULT 'Active',
  `expiration_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`member_id`, `full_name`, `date_of_birth`, `phone_number`, `email`, `membership_type_id`, `status`, `expiration_date`, `created_at`) VALUES
(1, 'abc abc', '2026-07-01', '078 337 443', 'Alya@gmail.com', 2, 'Active', '2026-08-21', '2026-07-21 01:06:29'),
(3, 'Lekha Soveng', '2026-07-06', '011222333', NULL, 2, 'Active', '2026-08-21', '2026-07-21 05:17:52'),
(4, 'Heng Sa', '2013-05-13', '045777666', 'heng@gmail.com', 1, 'Active', '2026-08-26', '2026-07-25 12:40:26'),
(5, 'Ben Tennyson', '1999-01-26', '076436444', 'benten@gmail.com', 2, 'Active', '2026-09-04', '2026-08-03 21:26:46'),
(6, 'Amy Stephen', '2026-08-17', '033444555', 'Amy@gmail.com', 1, 'Active', '2026-09-04', '2026-08-03 21:28:46');

--
-- Triggers `members`
--
DELIMITER $$
CREATE TRIGGER `set_member_expiration` BEFORE INSERT ON `members` FOR EACH ROW BEGIN
    
    SET NEW.expiration_date = DATE_ADD(NOW(), INTERVAL 1 MONTH);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `membership_types`
--

CREATE TABLE `membership_types` (
  `membership_type_id` int(11) NOT NULL,
  `type_name` varchar(50) NOT NULL,
  `max_books_allowed` int(11) NOT NULL,
  `loan_duration_weeks` int(11) NOT NULL DEFAULT 2
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_types`
--

INSERT INTO `membership_types` (`membership_type_id`, `type_name`, `max_books_allowed`, `loan_duration_weeks`) VALUES
(1, 'Basic', 1, 2),
(2, 'Premium', 3, 2);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `recipient_type` enum('User','Member','All_Staff') NOT NULL DEFAULT 'All_Staff',
  `recipient_id` int(11) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `recipient_type`, `recipient_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 'All_Staff', NULL, 'Overdue Reminder', '\"Impossible crush Try not to laugh\" borrowed by Lekha Soveng is now overdue!', 0, '2026-08-10 11:13:01'),
(2, 'All_Staff', NULL, 'Donation Received', 'A donation from Chan Tevy was recorded (1 book).', 0, '2026-08-10 19:12:15'),
(3, 'All_Staff', NULL, 'Donation Updated', 'The donation record for Chan Tevy was updated.', 0, '2026-08-10 19:12:20'),
(4, 'All_Staff', NULL, 'Book Borrowed', '\"Genius boy\" was borrowed by Ben Tennyson. Due in 14 days.', 0, '2026-08-10 22:00:36'),
(5, 'All_Staff', NULL, 'Book Returned', '\"Genius boy\" was returned by Ben Tennyson. Condition: Damaged.', 0, '2026-08-11 11:49:41'),
(6, 'All_Staff', NULL, 'Book Borrowed', '\"Greek Methodology\" was borrowed by abc abc. Due in 14 days.', 0, '2026-08-11 12:04:26'),
(7, 'All_Staff', NULL, 'Book Returned', '\"Greek Methodology\" was returned by abc abc. Condition: Damaged.', 0, '2026-08-11 12:04:33'),
(8, 'All_Staff', NULL, 'Book Borrowed', '\"Greek Methodology\" was borrowed by Heng Sa. Due in 14 days.', 0, '2026-08-16 20:36:06'),
(9, 'All_Staff', NULL, 'Book Returned', '\"Greek Methodology\" was returned by Heng Sa. Condition: Damaged.', 0, '2026-08-16 20:36:10'),
(10, 'All_Staff', NULL, 'Book Borrowed', '\"Genius boy\" was borrowed by Ben Tennyson. Due in 14 days.', 0, '2026-08-16 20:53:05'),
(11, 'All_Staff', NULL, 'Book Returned', '\"Genius boy\" was returned by Ben Tennyson. Condition: Damaged.', 0, '2026-08-16 20:53:09'),
(12, 'All_Staff', NULL, 'Book Borrowed', '\"Greek Methodology\" was borrowed by Heng Sa. Due in 14 days.', 0, '2026-08-16 20:57:51'),
(13, 'All_Staff', NULL, 'Book Returned', '\"Greek Methodology\" was returned by Heng Sa. Condition: Damaged.', 0, '2026-08-16 20:57:54'),
(14, 'All_Staff', NULL, 'Book Borrowed', '\"Greek Methodology\" was borrowed by Amy Stephen. Due in 14 days.', 0, '2026-08-16 21:03:43'),
(15, 'All_Staff', NULL, 'Book Returned', '\"Greek Methodology\" was returned by Amy Stephen. Condition: Damaged.', 0, '2026-08-16 21:03:46'),
(16, 'All_Staff', NULL, 'Book Borrowed', '\"Dragon \" was borrowed by abc abc. Due in 14 days.', 0, '2026-08-16 21:04:23'),
(17, 'All_Staff', NULL, 'Book Returned', '\"Dragon \" was returned by abc abc. Condition: Fair.', 0, '2026-08-16 21:04:26'),
(18, 'All_Staff', NULL, 'Book Borrowed', '\"Cinderella\" was borrowed by Lekha Soveng. Due in 14 days.', 0, '2026-08-16 21:04:36'),
(19, 'All_Staff', NULL, 'Book Returned', '\"Cinderella\" was returned by Lekha Soveng. Condition: Good.', 0, '2026-08-16 21:04:40'),
(20, 'All_Staff', NULL, 'Book Updated', '\"Dragon\" was updated.', 0, '2026-08-16 21:13:59'),
(21, 'All_Staff', NULL, 'Overdue Reminder', '\"Guide to Plants\" borrowed by abc abc is now overdue!', 1, '2026-08-16 21:32:31'),
(22, 'All_Staff', NULL, 'Overdue Reminder', '\"Vampire \" borrowed by abc abc is now overdue!', 1, '2026-08-16 21:32:31'),
(23, 'All_Staff', NULL, 'Overdue Reminder', '\"Neang Neath\" borrowed by Lekha Soveng is now overdue!', 1, '2026-08-16 21:32:31'),
(24, 'All_Staff', NULL, 'Overdue Reminder', '\"Vampire \" borrowed by abc abc is now overdue!', 0, '2026-08-16 21:32:31'),
(25, 'All_Staff', NULL, 'Overdue Reminder', '\"Guide to Plants\" borrowed by abc abc is now overdue!', 0, '2026-08-16 21:32:31'),
(26, 'All_Staff', NULL, 'Overdue Reminder', '\"Neang Neath\" borrowed by Lekha Soveng is now overdue!', 0, '2026-08-16 21:32:31'),
(27, 'All_Staff', NULL, 'Book Borrowed', '\"Greek Methodology\" was borrowed by Amy Stephen. Due in 14 days.', 0, '2026-08-16 21:32:39'),
(28, 'All_Staff', NULL, 'Book Returned', '\"Greek Methodology\" was returned by Amy Stephen. Condition: Damaged.', 0, '2026-08-16 21:32:43'),
(29, 'All_Staff', NULL, 'Book Added', '\"ខ្ញុំខុសគេ\" by សុទ្ធ បូជា was added to the inventory.', 0, '2026-08-23 00:45:32'),
(30, 'All_Staff', NULL, 'Book Borrowed', '\"D\'où tu viens, Petit Chien ?\" was borrowed by Lekha Soveng. Due in 14 days.', 0, '2026-08-23 01:06:56'),
(31, 'All_Staff', NULL, 'Book Borrowed', '\"Black\" was borrowed by abc abc. Due in 14 days.', 0, '2026-08-23 01:07:24'),
(32, 'All_Staff', NULL, 'Book Returned', '\"D\'où tu viens, Petit Chien ?\" was returned by Lekha Soveng. Condition: Good.', 0, '2026-08-23 01:07:27'),
(33, 'All_Staff', NULL, 'Donation Updated', 'The donation record for Chan Tevy was updated.', 0, '2026-09-03 11:45:27'),
(34, 'All_Staff', NULL, 'Overdue Reminder', '\"Black\" borrowed by abc abc is now overdue!', 0, '2026-09-07 10:06:38'),
(35, 'All_Staff', NULL, 'Overdue Reminder', '\"Black\" borrowed by abc abc is now overdue!', 0, '2026-09-07 10:06:38'),
(36, 'All_Staff', NULL, 'Donation Received', 'A donation from Abby was recorded (1 book).', 0, '2026-09-07 10:52:27'),
(37, 'All_Staff', NULL, 'Donation Received', 'A donation from dd was recorded (1 book).', 0, '2026-09-07 10:54:24'),
(38, 'All_Staff', NULL, 'Donation Filed to Inventory', '1 book from dd\'s donation was added to the library catalog.', 0, '2026-09-07 11:00:00'),
(39, 'All_Staff', NULL, 'Donation Filed to Inventory', '1 book from Abby\'s donation was added to the library catalog.', 0, '2026-09-07 11:00:44'),
(40, 'All_Staff', NULL, 'Donation Filed to Inventory', '1 book from Chan Tevy\'s donation was added to the library catalog.', 0, '2026-09-07 11:00:51'),
(41, 'All_Staff', NULL, 'Donation Filed to Inventory', '1 book from Sally\'s donation was added to the library catalog.', 0, '2026-09-07 23:31:16'),
(42, 'All_Staff', NULL, 'Book Borrowed', '\"A proper woman\" was borrowed by Ben Tennyson. Due in 14 days.', 0, '2026-09-07 23:34:12'),
(43, 'All_Staff', NULL, 'Book Returned', '\"A proper woman\" was returned by Ben Tennyson. Condition: Good.', 0, '2026-09-07 23:34:15'),
(44, 'All_Staff', NULL, 'Book Borrowed', '\"Aladdin\" was borrowed by Lekha Soveng. Due in 14 days.', 0, '2026-09-07 23:34:58'),
(45, 'All_Staff', NULL, 'Book Borrowed', '\"ABC\" was borrowed by Amy Stephen. Due in 14 days.', 0, '2026-09-07 23:52:02'),
(46, 'All_Staff', NULL, 'Book Returned', '\"ABC\" was returned by Amy Stephen. Condition: Good.', 0, '2026-09-07 23:52:07'),
(47, 'All_Staff', NULL, 'Book Returned', '\"Aladdin\" was returned by Lekha Soveng. Condition: Good.', 0, '2026-09-07 23:52:11'),
(48, 'All_Staff', NULL, 'Book Updated', '\"Avant, pendant, aprés\" was updated.', 0, '2026-10-15 00:49:57'),
(49, 'All_Staff', NULL, 'Book Updated', '\"Avant, pendant, aprés\" was updated.', 0, '2026-10-15 00:50:12'),
(50, 'All_Staff', NULL, 'Book Updated', '\"Avant, pendant, aprés\" was updated.', 0, '2026-10-15 00:50:25'),
(51, 'All_Staff', NULL, 'Book Updated', '\"Course de chars à Olympie\" was updated.', 0, '2026-10-15 00:50:38'),
(52, 'All_Staff', NULL, 'Book Updated', '\"Croatie\" was updated.', 0, '2026-10-15 00:50:52'),
(53, 'All_Staff', NULL, 'Book Updated', '\"Croatie\" was updated.', 0, '2026-10-15 00:51:25'),
(54, 'All_Staff', NULL, 'Book Updated', '\"DES AMIS DANS LA POLICE\" was updated.', 0, '2026-10-15 00:51:40'),
(55, 'All_Staff', NULL, 'Book Updated', '\"Diary of a Wimpy kid Double Down\" was updated.', 0, '2026-10-15 00:52:01'),
(56, 'All_Staff', NULL, 'Book Updated', '\"ភ្នំប្រុស ភ្នំស្រី\" was updated.', 0, '2026-10-15 00:53:09'),
(57, 'All_Staff', NULL, 'Book Updated', '\"Cambodia\" was updated.', 0, '2026-10-15 01:00:16'),
(58, 'All_Staff', NULL, 'Book Updated', '\"D\'où tu viens, Petit Chien ?\" was updated.', 0, '2026-10-15 01:00:35'),
(59, 'All_Staff', NULL, 'Book Updated', '\"Farm friends\" was updated.', 0, '2026-10-15 01:00:52'),
(60, 'All_Staff', NULL, 'Book Updated', '\"Guide to Home Plumbing\" was updated.', 0, '2026-10-15 01:01:27'),
(61, 'All_Staff', NULL, 'Book Updated', '\"Hector And the Secrets of Love\" was updated.', 0, '2026-10-15 01:01:48'),
(62, 'All_Staff', NULL, 'Book Updated', '\"I love my mommy\" was updated.', 0, '2026-10-15 01:02:11'),
(63, 'All_Staff', NULL, 'Book Updated', '\"Impossible crush Try not to laugh\" was updated.', 0, '2026-10-15 01:02:25'),
(64, 'All_Staff', NULL, 'Book Updated', '\"Kiss Cam\" was updated.', 0, '2026-10-15 01:02:34'),
(65, 'All_Staff', NULL, 'Book Updated', '\"L extraordinaire voyage du fakir qui etait reste coince dans une armoire\" was updated.', 0, '2026-10-15 01:02:44'),
(66, 'All_Staff', NULL, 'Book Updated', '\"la Peau de chagrin\" was updated.', 0, '2026-10-15 01:02:56'),
(67, 'All_Staff', NULL, 'Book Updated', '\"La vallee des dinosaures\" was updated.', 0, '2026-10-15 01:03:07'),
(68, 'All_Staff', NULL, 'Book Updated', '\"សេនាធិ ក៏ជ័យសង្គ្រាម\" was updated.', 0, '2026-10-15 01:03:24'),
(69, 'All_Staff', NULL, 'Book Updated', '\"ស្លាប់ និទានខ្មោច\" was updated.', 0, '2026-10-15 01:05:03'),
(70, 'All_Staff', NULL, 'Book Updated', '\"អ្នកជាមនុស្សស្នេហ៍ស្មោះបំផុត\" was updated.', 0, '2026-10-15 01:05:19'),
(71, 'All_Staff', NULL, 'Book Updated', '\"អ្នកតារក្សាមេដ\" was updated.', 0, '2026-10-15 01:05:33'),
(72, 'All_Staff', NULL, 'Book Updated', '\"Mad for Math ( Spy school the frsction mission )\" was updated.', 1, '2026-10-15 01:05:49'),
(73, 'All_Staff', NULL, 'Book Borrowed', '\"Avant, pendant, aprés\" was borrowed by Ben Tennyson. Due in 14 days.', 1, '2026-10-15 01:08:11'),
(74, 'All_Staff', NULL, 'Book Returned', '\"Avant, pendant, aprés\" was returned by Ben Tennyson. Condition: Good.', 1, '2026-10-15 01:08:24'),
(75, 'All_Staff', NULL, 'Book Borrowed', '\"Avant, pendant, aprés\" was borrowed by Amy Stephen. Due in 14 days.', 0, '2026-10-15 01:08:49'),
(76, 'All_Staff', NULL, 'Book Returned', '\"Avant, pendant, aprés\" was returned by Amy Stephen. Condition: Damaged.', 1, '2026-10-15 01:11:49'),
(77, 'All_Staff', NULL, 'Book Borrowed', '\"ខ្ញុំខុសគេ\" was borrowed by Heng Sa. Due in 14 days.', 0, '2026-10-15 01:36:40'),
(78, 'All_Staff', NULL, 'Book Returned', '\"ខ្ញុំខុសគេ\" was returned by Heng Sa. Condition: Good.', 0, '2026-10-15 01:36:59'),
(79, 'All_Staff', NULL, 'Book Borrowed', '\"Aladdin\" was borrowed by Lekha Soveng. Due in 14 days.', 0, '2026-10-15 01:45:40'),
(80, 'All_Staff', NULL, 'Book Updated', '\"Guide to Home Plumbing\" was updated.', 0, '2026-10-15 06:47:43'),
(81, 'All_Staff', NULL, 'Book Updated', '\"Guide to Home Plumbing\" was updated.', 0, '2026-10-15 06:47:59'),
(82, 'All_Staff', NULL, 'Book Updated', '\"A proper woman\" was updated.', 0, '2026-10-15 07:58:52'),
(83, 'All_Staff', NULL, 'Book Updated', '\"A proper woman\" was updated.', 0, '2026-10-15 08:00:12'),
(84, 'All_Staff', NULL, 'Book Updated', '\"Avant, pendant, aprés\" was updated.', 0, '2026-10-15 08:03:19'),
(85, 'All_Staff', NULL, 'Book Borrowed', '\"A proper woman\" was borrowed by Ben Tennyson. Due in 14 days.', 0, '2026-10-15 08:03:31'),
(86, 'All_Staff', NULL, 'Book Updated', '\"ខ្ញុំខុសគេ\" was updated.', 0, '2026-10-15 09:55:17'),
(87, 'All_Staff', NULL, 'Book Updated', '\"ខ្ញុំខុសគេ\" was updated.', 0, '2026-10-15 09:55:30'),
(88, 'All_Staff', NULL, 'Book Updated', '\"ក្មេងសាលាបារាំង\" was updated.', 0, '2026-10-15 09:56:38'),
(89, 'All_Staff', NULL, 'Book Updated', '\"ដំណើរផ្សងព្រេងរបស់ចៅម៉ឺយ\" was updated.', 0, '2026-10-15 09:58:42'),
(90, 'All_Staff', NULL, 'Book Updated', '\"វិមានផ្កាចម្ប៉ា\" was updated.', 0, '2026-10-15 10:01:14'),
(91, 'All_Staff', NULL, 'Book Updated', '\"ដំណើរផ្សងព្រេងរបស់ម៉ៅឃ្លី\" was updated.', 0, '2026-10-15 10:01:47'),
(92, 'All_Staff', NULL, 'Book Updated', '\"ខ្មោចចង់ស៊ីសាំងវ៉ិច\" was updated.', 0, '2026-10-15 10:03:14'),
(93, 'All_Staff', NULL, 'Book Updated', '\"ប្រាសាទបន្ទាយឆ្មារ\" was updated.', 0, '2026-10-15 10:04:10'),
(94, 'All_Staff', NULL, 'Book Updated', '\"ភ្នំប្រុស ភ្នំស្រី\" was updated.', 0, '2026-10-15 10:04:55'),
(95, 'All_Staff', NULL, 'Book Updated', '\"Kiss Cam\" was updated.', 0, '2026-10-15 10:05:27'),
(96, 'All_Staff', NULL, 'Book Updated', '\"ភ្នំប្រុស ភ្នំស្រី\" was updated.', 0, '2026-10-15 10:05:40'),
(97, 'All_Staff', NULL, 'Book Updated', '\"ប្រាសាទបន្ទាយឆ្មារ\" was updated.', 0, '2026-10-15 10:05:55'),
(98, 'All_Staff', NULL, 'Book Updated', '\"ខ្មោចចង់ស៊ីសាំងវ៉ិច\" was updated.', 0, '2026-10-15 10:06:22'),
(99, 'All_Staff', NULL, 'Book Updated', '\"វិមានផ្កាចម្ប៉ា\" was updated.', 0, '2026-10-15 10:06:47'),
(100, 'All_Staff', NULL, 'Book Updated', '\"Hector And the Secrets of Love\" was updated.', 0, '2026-10-15 10:07:34'),
(101, 'All_Staff', NULL, 'Book Updated', '\"Diary of a Wimpy kid Double Down\" was updated.', 0, '2026-10-15 10:07:52'),
(102, 'All_Staff', NULL, 'Book Updated', '\"The story of English in 100 words\" was updated.', 0, '2026-10-15 10:08:14'),
(103, 'All_Staff', NULL, 'Book Updated', '\"The Horse and His boy\" was updated.', 0, '2026-10-15 10:08:34'),
(104, 'All_Staff', NULL, 'Book Updated', '\"The silver Chair\" was updated.', 0, '2026-10-15 10:08:51'),
(105, 'All_Staff', NULL, 'Book Updated', '\"The House on Mango Street\" was updated.', 0, '2026-10-15 10:09:07'),
(106, 'All_Staff', NULL, 'Book Updated', '\"Storybook Collection\" was updated.', 0, '2026-10-15 10:09:30'),
(107, 'All_Staff', NULL, 'Book Updated', '\"Tangled\" was updated.', 0, '2026-10-15 10:09:46'),
(108, 'All_Staff', NULL, 'Book Updated', '\"Farm friends\" was updated.', 0, '2026-10-15 10:11:25');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `permissions`) VALUES
(1, 'Admin', '{\"staff\": [\"create\", \"read\", \"update\", \"delete\"], \"books\": [\"create\", \"read\", \"update\", \"delete\"], \"members\": [\"create\", \"read\", \"update\", \"delete\"], \"donations\": [\"create\", \"read\", \"update\", \"delete\"], \"events\": [\"create\", \"read\", \"update\", \"delete\"], \"feedback\": [\"read\", \"update\"], \"reports\": [\"read\"]}'),
(2, 'Librarian', '{\"staff\": [\"read\"], \"books\": [\"create\", \"read\", \"update\"], \"members\": [\"create\", \"read\", \"update\"], \"donations\": [\"create\", \"read\"], \"events\": [\"read\"], \"feedback\": [\"read\"]}');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`log_id`, `user_id`, `action`, `table_name`, `record_id`, `details`, `ip_address`, `created_at`) VALUES
(1, NULL, 'CREATE', 'books', 2, '{\"title\":\"ខ្ញុំខុសគេ\"}', '::1', '2026-07-19 05:45:37'),
(2, NULL, 'UPDATE', 'books', 2, NULL, '::1', '2026-07-19 05:49:48'),
(3, NULL, 'UPDATE', 'books', 1, NULL, '::1', '2026-07-19 05:57:28'),
(4, NULL, 'CREATE', 'books', 3, '{\"title\":\"អ្នកជាមនុស្សដ៏អស្ចារ្យបំផុត\"}', '::1', '2026-07-20 20:03:34'),
(5, NULL, 'UPDATE', 'books', 3, NULL, '::1', '2026-07-20 20:03:50'),
(6, NULL, 'DELETE', 'books', 1, NULL, '::1', '2026-07-20 20:04:10'),
(7, NULL, 'CREATE', 'members', 1, NULL, '::1', '2026-07-21 01:06:29'),
(8, NULL, 'UPDATE', 'members', 1, NULL, '::1', '2026-07-21 01:08:29'),
(9, NULL, 'UPDATE', 'members', 1, NULL, '::1', '2026-07-21 01:08:34'),
(10, NULL, 'UPDATE', 'members', 1, NULL, '::1', '2026-07-21 01:23:49'),
(11, NULL, 'CREATE', 'members', 2, NULL, '::1', '2026-07-21 01:27:31'),
(12, NULL, 'DELETE', 'members', 2, NULL, '::1', '2026-07-21 01:27:39'),
(13, NULL, 'CREATE', 'members', 3, NULL, '::1', '2026-07-21 05:17:52'),
(14, NULL, 'UPDATE', 'books', 2, NULL, '::1', '2026-07-21 06:00:57'),
(15, NULL, 'CREATE', 'books', 4, '{\"title\":\"VERS LA SOBRIÈTÈ HEUREUSE\"}', '::1', '2026-07-21 06:05:05'),
(16, 1, 'REGISTER', 'users', 1, NULL, '::1', '2026-07-24 04:56:40'),
(17, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-24 04:57:43'),
(18, 2, 'REGISTER', 'users', 2, NULL, '::1', '2026-07-24 05:02:58'),
(19, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-24 05:03:08'),
(20, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-25 02:02:25'),
(21, 1, 'BORROW', 'borrow_records', 1, '{\"member\":\"abc abc\",\"book\":\"VERS LA SOBRIÈTÈ HEUREUSE\"}', '::1', '2026-07-25 02:03:44'),
(22, 1, 'RETURN', 'borrow_records', 1, NULL, '::1', '2026-07-25 02:03:56'),
(23, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-25 08:55:15'),
(24, 1, 'BORROW', 'borrow_records', 2, '{\"member\":\"Lekha Soveng\",\"book\":\"ខ្ញុំខុសគេ\"}', '::1', '2026-07-25 08:55:39'),
(25, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-25 12:37:32'),
(26, 1, 'CREATE', 'books', 5, '{\"title\":\"Guide to Home Plumbing\"}', '::1', '2026-07-25 12:39:40'),
(27, 1, 'CREATE', 'members', 4, NULL, '::1', '2026-07-25 12:40:26'),
(28, 1, 'UPDATE', 'members', 4, NULL, '::1', '2026-07-25 12:40:35'),
(29, 1, 'BORROW', 'borrow_records', 3, '{\"member\":\"Heng Sa\",\"book\":\"Guide to Home Plumbing\"}', '::1', '2026-07-25 12:41:14'),
(30, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-25 18:13:13'),
(31, 1, 'UPDATE', 'books', 5, NULL, '::1', '2026-07-25 18:13:47'),
(32, 1, 'UPDATE', 'books', 4, NULL, '::1', '2026-07-25 18:13:59'),
(33, 1, 'UPDATE', 'books', 2, NULL, '::1', '2026-07-25 18:14:07'),
(34, 1, 'UPDATE', 'books', 3, NULL, '::1', '2026-07-25 18:14:20'),
(35, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-25 23:41:30'),
(36, 2, 'CREATE', 'books', 6, '{\"title\":\"Impossible crush Try not to laugh\"}', '::1', '2026-07-25 23:42:46'),
(37, 2, 'RETURN', 'borrow_records', 2, NULL, '::1', '2026-07-25 23:43:23'),
(38, 2, 'RETURN', 'borrow_records', 3, NULL, '::1', '2026-07-25 23:43:27'),
(39, 2, 'BORROW', 'borrow_records', 4, '{\"member\":\"Lekha Soveng\",\"book\":\"Impossible crush Try not to laugh\"}', '::1', '2026-07-25 23:44:13'),
(40, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-26 22:21:33'),
(41, 1, 'CREATE', 'events', 1, NULL, '::1', '2026-07-26 22:22:39'),
(42, 1, 'UPDATE', 'events', 1, NULL, '::1', '2026-07-26 22:22:59'),
(43, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-27 22:08:44'),
(44, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-28 07:52:57'),
(45, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-28 08:26:50'),
(46, 2, 'CREATE', 'donations', 1, '{\"donorName\":\"Ty\",\"bookCount\":1}', '::1', '2026-07-28 08:39:29'),
(47, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-28 08:40:30'),
(48, 2, 'CREATE', 'donations', 2, '{\"donorName\":\"Flin\",\"bookCount\":9}', '::1', '2026-07-28 08:42:04'),
(49, 2, 'DELETE', 'donations', 9, NULL, '::1', '2026-07-28 08:50:07'),
(50, 2, 'DELETE', 'donations', 2, NULL, '::1', '2026-07-28 08:50:10'),
(51, 2, 'DELETE', 'donations', 3, NULL, '::1', '2026-07-28 08:50:13'),
(52, 2, 'DELETE', 'donations', 4, NULL, '::1', '2026-07-28 08:50:16'),
(53, 2, 'DELETE', 'donations', 5, NULL, '::1', '2026-07-28 08:50:19'),
(54, 2, 'DELETE', 'donations', 6, NULL, '::1', '2026-07-28 08:50:22'),
(55, 2, 'DELETE', 'donations', 7, NULL, '::1', '2026-07-28 08:50:24'),
(56, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-28 09:11:52'),
(57, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-28 09:46:45'),
(58, 2, 'DELETE', 'books', 16, NULL, '::1', '2026-07-28 09:46:57'),
(59, 2, 'DELETE', 'books', 15, NULL, '::1', '2026-07-28 09:47:01'),
(60, 2, 'DELETE', 'books', 13, NULL, '::1', '2026-07-28 09:47:04'),
(61, 2, 'DELETE', 'books', 9, NULL, '::1', '2026-07-28 09:47:06'),
(62, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-28 13:46:33'),
(63, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-28 19:57:01'),
(64, 2, 'CREATE', 'donations', 37, '{\"donorName\":\"Ali\",\"itemCount\":1,\"filedToInventory\":true}', '::1', '2026-07-28 20:05:48'),
(65, 2, 'CREATE', 'donations', 38, '{\"donorName\":\"Ben\",\"itemCount\":2,\"filedToInventory\":true}', '::1', '2026-07-28 20:08:01'),
(66, 2, 'CREATE', 'donations', 39, '{\"donorName\":\"Andres\",\"itemCount\":1,\"filedToInventory\":true}', '::1', '2026-07-28 20:09:35'),
(67, 2, 'CREATE', 'donations', 40, '{\"donorName\":\"Ceco;\",\"itemCount\":1,\"filedToInventory\":false}', '::1', '2026-07-28 20:11:56'),
(68, 2, 'UPDATE', 'donations', 39, NULL, '::1', '2026-07-28 20:12:38'),
(69, 2, 'CREATE', 'donations', 41, '{\"donorName\":\"Kairo\",\"itemCount\":1,\"filedToInventory\":true}', '::1', '2026-07-28 20:16:00'),
(70, 2, 'UPDATE', 'donations', 41, NULL, '::1', '2026-07-28 20:16:17'),
(71, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-28 20:43:03'),
(72, 1, 'CREATE', 'donations', 43, '{\"donorName\":\"Steven\",\"itemCount\":2,\"filedToInventory\":true}', '::1', '2026-07-28 20:46:20'),
(73, 1, 'BORROW', 'borrow_records', 5, '{\"member\":\"abc abc\",\"book\":\"Guide to Plants\"}', '::1', '2026-07-28 20:47:28'),
(74, 1, 'BORROW', 'borrow_records', 6, '{\"member\":\"abc abc\",\"book\":\"Cinderella\"}', '::1', '2026-07-28 20:47:48'),
(75, 1, 'BORROW', 'borrow_records', 7, '{\"member\":\"abc abc\",\"book\":\"Vampire \"}', '::1', '2026-07-28 20:47:59'),
(76, 1, 'DELETE', 'books', 8, NULL, '::1', '2026-07-28 21:18:06'),
(77, 1, 'DELETE', 'books', 11, NULL, '::1', '2026-07-28 21:18:14'),
(78, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-28 23:29:44'),
(79, 1, 'REPLY', 'feedback', 2, NULL, '::1', '2026-07-28 23:30:52'),
(80, 2, 'LOGIN', 'users', 2, NULL, '::ffff:127.0.0.1', '2026-07-29 00:00:23'),
(81, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-29 04:46:08'),
(82, 2, 'CREATE', 'donations', 44, '{\"donorName\":\"Sally\",\"itemCount\":1,\"filedToInventory\":true}', '::1', '2026-07-29 04:49:24'),
(83, 2, 'BORROW', 'borrow_records', 8, '{\"member\":\"Lekha Soveng\",\"book\":\"Neang Neath\"}', '::1', '2026-07-29 04:51:16'),
(84, 2, 'RETURN', 'borrow_records', 6, NULL, '::1', '2026-07-29 04:51:50'),
(85, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-29 08:06:48'),
(86, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-29 08:07:06'),
(87, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-29 08:47:56'),
(88, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-07-29 20:42:10'),
(89, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-07-29 21:42:58'),
(90, 2, 'DELETE', 'books', 14, NULL, '::1', '2026-07-29 22:12:42'),
(91, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-08-03 20:35:39'),
(92, 1, 'CREATE', 'members', 5, NULL, '::1', '2026-08-03 21:26:46'),
(93, 1, 'CREATE', 'members', 6, NULL, '::1', '2026-08-03 21:28:46'),
(94, 1, 'DELETE', 'books', 10, NULL, '::1', '2026-08-03 21:35:33'),
(95, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-08-03 21:40:03'),
(96, 1, 'DELETE', 'books', 21, NULL, '::1', '2026-08-03 21:40:43'),
(97, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-03 23:19:32'),
(98, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-08-04 01:34:06'),
(99, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-08-05 06:48:48'),
(100, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-05 06:54:52'),
(101, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-05 06:55:06'),
(102, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-05 06:56:25'),
(103, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-08-05 20:18:31'),
(104, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-08-05 20:31:03'),
(105, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-05 20:31:19'),
(106, 3, 'REGISTER', 'users', 3, NULL, '::1', '2026-08-05 20:37:36'),
(107, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-05 20:37:42'),
(108, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-05 20:40:13'),
(109, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-05 22:02:30'),
(110, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-05 22:04:02'),
(111, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-05 22:11:04'),
(112, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-05 22:11:17'),
(113, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-08-05 22:11:31'),
(114, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-05 22:13:24'),
(115, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-06 05:12:19'),
(116, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-07 20:52:51'),
(117, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-09 23:56:55'),
(118, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-10 00:28:08'),
(119, 3, 'CREATE', 'users', 4, NULL, '::1', '2026-08-10 00:28:44'),
(120, 3, 'UPDATE', 'users', 4, NULL, '::1', '2026-08-10 00:28:49'),
(121, 3, 'DELETE', 'users', 4, NULL, '::1', '2026-08-10 00:33:07'),
(122, 3, 'CREATE', 'users', 5, NULL, '::1', '2026-08-10 00:33:49'),
(123, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-10 10:49:39'),
(124, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":1}', '::1', '2026-08-10 11:13:01'),
(125, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-10 18:44:49'),
(126, 3, 'CREATE', 'donations', 47, '{\"donorName\":\"Chan Tevy\",\"itemCount\":1,\"filedToInventory\":false}', '::1', '2026-08-10 19:12:15'),
(127, 3, 'UPDATE', 'donations', 47, NULL, '::1', '2026-08-10 19:12:20'),
(128, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-10 20:20:59'),
(129, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-10 21:59:55'),
(130, 3, 'BORROW', 'borrow_records', 9, '{\"member\":\"Ben Tennyson\",\"book\":\"Genius boy\"}', '::1', '2026-08-10 22:00:36'),
(131, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-11 11:49:06'),
(132, 3, 'RETURN', 'borrow_records', 9, NULL, '::1', '2026-08-11 11:49:41'),
(133, 3, 'BORROW', 'borrow_records', 10, '{\"member\":\"abc abc\",\"book\":\"Greek Methodology\"}', '::1', '2026-08-11 12:04:26'),
(134, 3, 'RETURN', 'borrow_records', 10, NULL, '::1', '2026-08-11 12:04:33'),
(135, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-11 12:57:19'),
(136, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-16 20:33:10'),
(137, 3, 'BORROW', 'borrow_records', 11, '{\"member\":\"Heng Sa\",\"book\":\"Greek Methodology\"}', '::1', '2026-08-16 20:36:06'),
(138, 3, 'RETURN', 'borrow_records', 11, NULL, '::1', '2026-08-16 20:36:10'),
(139, 3, 'BORROW', 'borrow_records', 12, '{\"member\":\"Ben Tennyson\",\"book\":\"Genius boy\"}', '::1', '2026-08-16 20:53:05'),
(140, 3, 'RETURN', 'borrow_records', 12, NULL, '::1', '2026-08-16 20:53:09'),
(141, 3, 'BORROW', 'borrow_records', 13, '{\"member\":\"Heng Sa\",\"book\":\"Greek Methodology\"}', '::1', '2026-08-16 20:57:51'),
(142, 3, 'RETURN', 'borrow_records', 13, NULL, '::1', '2026-08-16 20:57:54'),
(143, 3, 'BORROW', 'borrow_records', 14, '{\"member\":\"Amy Stephen\",\"book\":\"Greek Methodology\"}', '::1', '2026-08-16 21:03:43'),
(144, 3, 'RETURN', 'borrow_records', 14, NULL, '::1', '2026-08-16 21:03:46'),
(145, 3, 'BORROW', 'borrow_records', 15, '{\"member\":\"abc abc\",\"book\":\"Dragon \"}', '::1', '2026-08-16 21:04:23'),
(146, 3, 'RETURN', 'borrow_records', 15, NULL, '::1', '2026-08-16 21:04:26'),
(147, 3, 'BORROW', 'borrow_records', 16, '{\"member\":\"Lekha Soveng\",\"book\":\"Cinderella\"}', '::1', '2026-08-16 21:04:36'),
(148, 3, 'RETURN', 'borrow_records', 16, NULL, '::1', '2026-08-16 21:04:40'),
(149, 3, 'UPDATE', 'books', 7, NULL, '::1', '2026-08-16 21:13:59'),
(150, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-16 21:32:31'),
(151, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":3}', '::1', '2026-08-16 21:32:31'),
(152, 3, 'BORROW', 'borrow_records', 17, '{\"member\":\"Amy Stephen\",\"book\":\"Greek Methodology\"}', '::1', '2026-08-16 21:32:39'),
(153, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-16 21:32:40'),
(154, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-16 21:32:40'),
(155, 3, 'RETURN', 'borrow_records', 17, NULL, '::1', '2026-08-16 21:32:43'),
(156, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-16 21:32:43'),
(157, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-16 21:32:43'),
(158, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-16 21:43:45'),
(159, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-20 07:06:59'),
(160, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-22 07:15:48'),
(161, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-22 07:38:51'),
(162, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-22 07:38:51'),
(163, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-22 12:20:15'),
(164, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-23 00:32:16'),
(165, 3, 'BACKUP_CREATE', 'database', NULL, '{\"filename\":\"backup-2026-08-23T07-32-27.sql\"}', '::1', '2026-08-23 00:32:29'),
(166, 3, 'BACKUP_DELETE', 'database', NULL, '{\"filename\":\"backup-2026-08-23T07-32-27.sql\"}', '::1', '2026-08-23 00:32:41'),
(167, 3, 'BACKUP_CREATE', 'database', NULL, '{\"filename\":\"backup-2026-08-23T07-32-44.sql\"}', '::1', '2026-08-23 00:32:46'),
(168, 3, 'BACKUP_RESTORE', 'database', NULL, '{\"filename\":\"backup-2026-08-23T07-36-17.sql\"}', '::1', '2026-08-23 00:40:56'),
(169, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:07'),
(170, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:07'),
(171, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:28'),
(172, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:28'),
(173, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:35'),
(174, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:35'),
(175, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:39'),
(176, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:41:39'),
(177, 3, 'CREATE', 'books', 28, '{\"title\":\"ខ្ញុំខុសគេ\"}', '::1', '2026-08-23 00:45:32'),
(178, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:45:34'),
(179, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:45:34'),
(180, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:45:36'),
(181, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:45:36'),
(182, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:45:39'),
(183, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:45:39'),
(184, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:51:53'),
(185, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:51:53'),
(186, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:51:58'),
(187, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:51:58'),
(188, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:51:59'),
(189, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 00:51:59'),
(190, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:06:42'),
(191, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:06:42'),
(192, 3, 'BORROW', 'borrow_records', 18, '{\"member\":\"Lekha Soveng\",\"book\":\"D\'où tu viens, Petit Chien ?\"}', '::1', '2026-08-23 01:06:56'),
(193, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:06:56'),
(194, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:06:56'),
(195, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:07:02'),
(196, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:07:02'),
(197, 3, 'BORROW', 'borrow_records', 19, '{\"member\":\"abc abc\",\"book\":\"Black\"}', '::1', '2026-08-23 01:07:24'),
(198, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:07:24'),
(199, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:07:24'),
(200, 3, 'RETURN', 'borrow_records', 18, NULL, '::1', '2026-08-23 01:07:27'),
(201, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:07:27'),
(202, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-23 01:07:27'),
(203, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-24 10:17:16'),
(204, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-08-24 10:17:52'),
(205, 3, 'BACKUP_CREATE', 'database', NULL, '{\"filename\":\"backup-2026-08-24T17-22-36.sql\"}', '::1', '2026-08-24 10:22:39'),
(206, 3, 'BACKUP_CREATE', 'database', NULL, '{\"filename\":\"backup-2026-08-24T17-22-44.sql\"}', '::1', '2026-08-24 10:22:46'),
(207, 3, 'BACKUP_CREATE', 'database', NULL, '{\"filename\":\"backup-2026-08-24T17-22-48.sql\"}', '::1', '2026-08-24 10:22:50'),
(208, 3, 'BACKUP_DELETE', 'database', NULL, '{\"filename\":\"backup-2026-08-24T17-22-48.sql\"}', '::1', '2026-08-24 10:22:54'),
(209, 3, 'BACKUP_RESTORE', 'database', NULL, '{\"filename\":\"backup-2026-08-24T17-23-51.sql\"}', '::1', '2026-08-25 02:56:53'),
(210, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-08-25 03:12:24'),
(211, 1, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-25 03:15:27'),
(212, 1, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-08-25 03:15:27'),
(213, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-09-01 07:58:11'),
(214, 3, 'UPDATE', 'users', 2, NULL, '::1', '2026-09-01 08:22:23'),
(215, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-09-03 10:57:05'),
(216, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-03 10:57:25'),
(217, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-03 10:57:25'),
(218, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-03 10:59:08'),
(219, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-03 10:59:08'),
(220, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-03 11:00:18'),
(221, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-03 11:00:18'),
(222, 3, 'UPDATE', 'users', 2, NULL, '::1', '2026-09-03 11:01:51'),
(223, 3, 'LOGOUT', 'users', 3, NULL, '::1', '2026-09-03 11:01:57'),
(224, 1, 'LOGIN', 'users', 1, NULL, '::1', '2026-09-03 11:02:03'),
(225, 1, 'LOGOUT', 'users', 1, NULL, '::1', '2026-09-03 11:02:26'),
(226, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-09-03 11:02:31'),
(227, 3, 'LOGOUT', 'users', 3, NULL, '::1', '2026-09-03 11:02:43'),
(228, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-09-03 11:02:47'),
(229, 2, 'LOGOUT', 'users', 2, NULL, '::1', '2026-09-03 11:03:00'),
(230, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-09-03 11:03:05'),
(231, 3, 'UPDATE', 'users', 2, NULL, '::1', '2026-09-03 11:03:25'),
(232, 3, 'LOGOUT', 'users', 3, NULL, '::1', '2026-09-03 11:03:30'),
(233, 2, 'LOGIN', 'users', 2, NULL, '::1', '2026-09-03 11:03:34'),
(234, 2, 'LOGOUT', 'users', 2, NULL, '::1', '2026-09-03 11:03:46'),
(235, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-09-03 11:03:50'),
(236, 3, 'UPDATE', 'donations', 47, NULL, '::1', '2026-09-03 11:45:27'),
(237, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-09-07 10:06:21'),
(238, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":1}', '::1', '2026-09-07 10:06:38'),
(239, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 10:06:38'),
(240, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 10:06:41'),
(241, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 10:06:41'),
(242, 3, 'CREATE', 'donations', 48, '{\"donorName\":\"Abby\",\"itemCount\":1,\"filedToInventory\":false}', '::1', '2026-09-07 10:52:27'),
(243, 3, 'CREATE', 'donations', 49, '{\"donorName\":\"dd\",\"itemCount\":1,\"filedToInventory\":false}', '::1', '2026-09-07 10:54:24'),
(244, 3, 'FILE_TO_INVENTORY', 'donations', 49, '{\"bookCount\":1}', '::1', '2026-09-07 11:00:00'),
(245, 3, 'FILE_TO_INVENTORY', 'donations', 48, '{\"bookCount\":1}', '::1', '2026-09-07 11:00:44'),
(246, 3, 'FILE_TO_INVENTORY', 'donations', 47, '{\"bookCount\":1}', '::1', '2026-09-07 11:00:51'),
(247, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-09-07 23:11:23'),
(248, 3, 'FILE_TO_INVENTORY', 'donations', 44, '{\"bookCount\":1}', '::1', '2026-09-07 23:31:16'),
(249, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:33:25'),
(250, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:33:25'),
(251, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:03'),
(252, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:03'),
(253, 3, 'BORROW', 'borrow_records', 20, '{\"member\":\"Ben Tennyson\",\"book\":\"A proper woman\"}', '::1', '2026-09-07 23:34:12'),
(254, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:12'),
(255, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:12'),
(256, 3, 'RETURN', 'borrow_records', 20, NULL, '::1', '2026-09-07 23:34:15'),
(257, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:15'),
(258, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:15'),
(259, 3, 'BORROW', 'borrow_records', 21, '{\"member\":\"Lekha Soveng\",\"book\":\"Aladdin\"}', '::1', '2026-09-07 23:34:58'),
(260, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:58'),
(261, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:34:58'),
(262, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:51:42'),
(263, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:51:42'),
(264, 3, 'BORROW', 'borrow_records', 22, '{\"member\":\"Amy Stephen\",\"book\":\"ABC\"}', '::1', '2026-09-07 23:52:02'),
(265, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:52:02'),
(266, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:52:02'),
(267, 3, 'RETURN', 'borrow_records', 22, NULL, '::1', '2026-09-07 23:52:07'),
(268, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:52:07'),
(269, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:52:07'),
(270, 3, 'RETURN', 'borrow_records', 21, NULL, '::1', '2026-09-07 23:52:11'),
(271, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:52:11'),
(272, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-09-07 23:52:11'),
(273, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-14 23:18:15'),
(274, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-14 23:18:27'),
(275, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-14 23:18:27'),
(276, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-14 23:18:28'),
(277, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-14 23:18:28'),
(278, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-15 00:41:05'),
(279, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 00:46:19'),
(280, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 00:46:19'),
(281, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 00:46:28'),
(282, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 00:46:28'),
(283, 3, 'UPDATE', 'books', 78, NULL, '::1', '2026-10-15 00:49:57'),
(284, 3, 'UPDATE', 'books', 78, NULL, '::1', '2026-10-15 00:50:12'),
(285, 3, 'UPDATE', 'books', 78, NULL, '::1', '2026-10-15 00:50:25'),
(286, 3, 'UPDATE', 'books', 94, NULL, '::1', '2026-10-15 00:50:38'),
(287, 3, 'UPDATE', 'books', 71, NULL, '::1', '2026-10-15 00:50:52'),
(288, 3, 'UPDATE', 'books', 71, NULL, '::1', '2026-10-15 00:51:25'),
(289, 3, 'UPDATE', 'books', 82, NULL, '::1', '2026-10-15 00:51:40'),
(290, 3, 'UPDATE', 'books', 52, NULL, '::1', '2026-10-15 00:52:01'),
(291, 3, 'UPDATE', 'books', 47, NULL, '::1', '2026-10-15 00:53:09'),
(292, 3, 'UPDATE', 'books', 72, NULL, '::1', '2026-10-15 01:00:16'),
(293, 3, 'UPDATE', 'books', 92, NULL, '::1', '2026-10-15 01:00:35'),
(294, 3, 'UPDATE', 'books', 61, NULL, '::1', '2026-10-15 01:00:52'),
(295, 3, 'UPDATE', 'books', 68, NULL, '::1', '2026-10-15 01:01:27'),
(296, 3, 'UPDATE', 'books', 51, NULL, '::1', '2026-10-15 01:01:48'),
(297, 3, 'UPDATE', 'books', 64, NULL, '::1', '2026-10-15 01:02:11'),
(298, 3, 'UPDATE', 'books', 48, NULL, '::1', '2026-10-15 01:02:25'),
(299, 3, 'UPDATE', 'books', 50, NULL, '::1', '2026-10-15 01:02:34'),
(300, 3, 'UPDATE', 'books', 86, NULL, '::1', '2026-10-15 01:02:44'),
(301, 3, 'UPDATE', 'books', 85, NULL, '::1', '2026-10-15 01:02:56'),
(302, 3, 'UPDATE', 'books', 90, NULL, '::1', '2026-10-15 01:03:07'),
(303, 3, 'UPDATE', 'books', 32, NULL, '::1', '2026-10-15 01:03:24'),
(304, 3, 'UPDATE', 'books', 42, NULL, '::1', '2026-10-15 01:05:03'),
(305, 3, 'UPDATE', 'books', 29, NULL, '::1', '2026-10-15 01:05:19'),
(306, 3, 'UPDATE', 'books', 43, NULL, '::1', '2026-10-15 01:05:32'),
(307, 3, 'UPDATE', 'books', 70, NULL, '::1', '2026-10-15 01:05:49'),
(308, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:07:59'),
(309, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:07:59'),
(310, 3, 'BORROW', 'borrow_records', 23, '{\"member\":\"Ben Tennyson\",\"book\":\"Avant, pendant, aprés\"}', '::1', '2026-10-15 01:08:11'),
(311, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:08:11'),
(312, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:08:11'),
(313, 3, 'RETURN', 'borrow_records', 23, NULL, '::1', '2026-10-15 01:08:24'),
(314, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:08:24'),
(315, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:08:24'),
(316, 3, 'BORROW', 'borrow_records', 24, '{\"member\":\"Amy Stephen\",\"book\":\"Avant, pendant, aprés\"}', '::1', '2026-10-15 01:08:49'),
(317, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:08:49'),
(318, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:08:49'),
(319, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:11:44'),
(320, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:11:44'),
(321, 3, 'RETURN', 'borrow_records', 24, NULL, '::1', '2026-10-15 01:11:49'),
(322, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:11:49'),
(323, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:11:49'),
(324, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:14:52'),
(325, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:14:52'),
(326, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:14:54'),
(327, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:14:54'),
(328, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:19:44'),
(329, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:19:44'),
(330, 3, 'CREATE', 'users', 6, NULL, '::1', '2026-10-15 01:20:28'),
(331, 3, 'LOGOUT', 'users', 3, NULL, '::1', '2026-10-15 01:20:32'),
(332, 6, 'LOGIN', 'users', 6, NULL, '::1', '2026-10-15 01:20:46'),
(333, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:20:57'),
(334, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:20:57'),
(335, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:20:58'),
(336, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:20:58'),
(337, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:21:01'),
(338, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:21:01'),
(339, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:21:11'),
(340, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:21:11'),
(341, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:21:20'),
(342, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:21:20'),
(343, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:22:51'),
(344, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:22:51'),
(345, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:22:56'),
(346, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:22:56'),
(347, 6, 'LOGOUT', 'users', 6, NULL, '::1', '2026-10-15 01:23:00'),
(348, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-15 01:23:08'),
(349, 3, 'UPDATE', 'users', 6, NULL, '::1', '2026-10-15 01:23:20'),
(350, 3, 'LOGOUT', 'users', 3, NULL, '::1', '2026-10-15 01:23:24'),
(351, 6, 'LOGIN', 'users', 6, NULL, '::1', '2026-10-15 01:23:29'),
(352, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:23:31'),
(353, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:23:31'),
(354, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:23:32'),
(355, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:23:32'),
(356, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:29:59'),
(357, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:29:59'),
(358, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:30:07'),
(359, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:30:07'),
(360, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:30:14'),
(361, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:30:14'),
(362, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:30:28'),
(363, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:30:28'),
(364, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:34:33'),
(365, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:34:33'),
(366, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:21'),
(367, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:21'),
(368, 6, 'BORROW', 'borrow_records', 25, '{\"member\":\"Heng Sa\",\"book\":\"ខ្ញុំខុសគេ\"}', '::1', '2026-10-15 01:36:40'),
(369, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:40'),
(370, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:40'),
(371, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:52'),
(372, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:52'),
(373, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:56'),
(374, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:56'),
(375, 6, 'RETURN', 'borrow_records', 25, NULL, '::1', '2026-10-15 01:36:59'),
(376, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:59'),
(377, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:36:59'),
(378, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:37:30'),
(379, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:37:30'),
(380, 6, 'LOGOUT', 'users', 6, NULL, '::1', '2026-10-15 01:37:41'),
(381, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-15 01:38:01'),
(382, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:45:31'),
(383, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:45:31'),
(384, 3, 'BORROW', 'borrow_records', 26, '{\"member\":\"Lekha Soveng\",\"book\":\"Aladdin\"}', '::1', '2026-10-15 01:45:40'),
(385, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:45:40'),
(386, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 01:45:40'),
(387, 6, 'LOGIN', 'users', 6, NULL, '::1', '2026-10-15 06:34:20'),
(388, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 06:34:35'),
(389, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 06:34:35'),
(390, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 06:34:43'),
(391, 6, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 06:34:43'),
(392, 6, 'LOGOUT', 'users', 6, NULL, '::1', '2026-10-15 06:47:19'),
(393, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-15 06:47:24'),
(394, 3, 'UPDATE', 'books', 68, NULL, '::1', '2026-10-15 06:47:43'),
(395, 3, 'UPDATE', 'books', 68, NULL, '::1', '2026-10-15 06:47:59'),
(396, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 06:49:12'),
(397, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 06:49:12'),
(398, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-15 07:48:54'),
(399, 3, 'UPDATE', 'books', 49, NULL, '::1', '2026-10-15 07:58:52'),
(400, 3, 'UPDATE', 'books', 49, NULL, '::1', '2026-10-15 08:00:12'),
(401, 3, 'UPDATE', 'books', 78, NULL, '::1', '2026-10-15 08:03:19'),
(402, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 08:03:23'),
(403, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 08:03:23'),
(404, 3, 'BORROW', 'borrow_records', 27, '{\"member\":\"Ben Tennyson\",\"book\":\"A proper woman\"}', '::1', '2026-10-15 08:03:31'),
(405, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 08:03:31'),
(406, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 08:03:31'),
(407, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 08:12:01'),
(408, 3, 'REFRESH_OVERDUE', 'borrow_records', NULL, '{\"count\":0}', '::1', '2026-10-15 08:12:01'),
(409, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-15 08:57:15'),
(410, 3, 'UPDATE', 'books', 28, NULL, '::1', '2026-10-15 09:55:17'),
(411, 3, 'UPDATE', 'books', 28, NULL, '::1', '2026-10-15 09:55:30'),
(412, 3, 'UPDATE', 'books', 30, NULL, '::1', '2026-10-15 09:56:38'),
(413, 3, 'LOGIN', 'users', 3, NULL, '::1', '2026-10-15 09:57:54'),
(414, 3, 'UPDATE', 'books', 31, NULL, '::1', '2026-10-15 09:58:42'),
(415, 3, 'UPDATE', 'books', 37, NULL, '::1', '2026-10-15 10:01:14'),
(416, 3, 'UPDATE', 'books', 31, NULL, '::1', '2026-10-15 10:01:47'),
(417, 3, 'UPDATE', 'books', 39, NULL, '::1', '2026-10-15 10:03:14'),
(418, 3, 'UPDATE', 'books', 46, NULL, '::1', '2026-10-15 10:04:10'),
(419, 3, 'UPDATE', 'books', 47, NULL, '::1', '2026-10-15 10:04:55'),
(420, 3, 'UPDATE', 'books', 50, NULL, '::1', '2026-10-15 10:05:27'),
(421, 3, 'UPDATE', 'books', 47, NULL, '::1', '2026-10-15 10:05:40'),
(422, 3, 'UPDATE', 'books', 46, NULL, '::1', '2026-10-15 10:05:55'),
(423, 3, 'UPDATE', 'books', 39, NULL, '::1', '2026-10-15 10:06:22'),
(424, 3, 'UPDATE', 'books', 37, NULL, '::1', '2026-10-15 10:06:47'),
(425, 3, 'UPDATE', 'books', 51, NULL, '::1', '2026-10-15 10:07:34'),
(426, 3, 'UPDATE', 'books', 52, NULL, '::1', '2026-10-15 10:07:52'),
(427, 3, 'UPDATE', 'books', 53, NULL, '::1', '2026-10-15 10:08:13'),
(428, 3, 'UPDATE', 'books', 54, NULL, '::1', '2026-10-15 10:08:34'),
(429, 3, 'UPDATE', 'books', 55, NULL, '::1', '2026-10-15 10:08:51'),
(430, 3, 'UPDATE', 'books', 57, NULL, '::1', '2026-10-15 10:09:07'),
(431, 3, 'UPDATE', 'books', 58, NULL, '::1', '2026-10-15 10:09:30'),
(432, 3, 'UPDATE', 'books', 60, NULL, '::1', '2026-10-15 10:09:46'),
(433, 3, 'UPDATE', 'books', 61, NULL, '::1', '2026-10-15 10:11:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `hash_password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `permission_overrides` longtext DEFAULT NULL,
  `permissions` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `phone_number`, `hash_password`, `role_id`, `created_at`, `is_active`, `permission_overrides`, `permissions`) VALUES
(1, 'Lisa', 'Amber', 'lisa@gmail.com', '099999999', '$2b$10$T0xtMYQUvsdzc5PBfUnZ8ejA49vLv1iycnIhQNPoL21Rsdqjuv55e', 2, '2026-07-24 04:56:40', 1, NULL, NULL),
(2, 'fa', 'ling', 'fafa@gmail.com', '099999999', '$2b$10$Xf1TAjaMebIjsrP8GQyDQ.yBvJsZsG2B25cwZRu9tx/mf1nvEKtBu', 2, '2026-07-24 05:02:58', 1, NULL, '{\"inventory\":{\"create\":true,\"read\":true,\"update\":true,\"delete\":true},\"borrow_return\":{\"create\":true,\"read\":true,\"update\":true,\"delete\":true},\"members\":{\"create\":true,\"read\":true,\"update\":true,\"delete\":true},\"donations\":{\"create\":true,\"read\":true,\"update\":true,\"delete\":true},\"reports\":{\"create\":true,\"read\":true,\"update\":true,\"delete\":true},\"feedback\":{\"create\":true,\"read\":true,\"update\":true,\"delete\":true},\"entry\":{\"create\":true,\"read\":true,\"update\":true,\"delete\":true}}'),
(3, 'Genesis', 'Admin', 'genesis@gmail.com', '099767898', '$2b$10$fvQbUV30c.RUKSha50CV3ONHFiLLp7kxYN8pfzcmmRLQmgJRU3amO', 1, '2026-08-05 20:37:36', 1, NULL, NULL),
(5, 'dara', 'sok', 'dara@gmail.com', '066777888', '$2b$10$DivdM42qgfCchaP1FWv3COhohl5n19RNAK.gylH0BLMb8ClxTknJW', 1, '2026-08-10 00:33:49', 1, NULL, NULL),
(6, 'Bona', 'Sok', 'bona@gmail.com', '092888999', '$2b$10$4KQDO3DyUR0e3raUZEXT/ug8eRwhr.Zir76QK4Hlw9GnK/4GJAQa6', 2, '2026-10-15 01:20:28', 1, NULL, '{\"inventory\":{\"create\":true,\"read\":true,\"update\":false,\"delete\":false},\"borrow_return\":{\"create\":true,\"read\":true,\"update\":false,\"delete\":false},\"members\":{\"create\":true,\"read\":true,\"update\":false,\"delete\":false},\"donations\":{\"create\":true,\"read\":true,\"update\":false,\"delete\":false},\"reports\":{\"create\":true,\"read\":true,\"update\":false,\"delete\":false},\"feedback\":{\"create\":true,\"read\":true,\"update\":false,\"delete\":false}}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`);

--
-- Indexes for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD PRIMARY KEY (`borrow_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `issued_by` (`issued_by`);

--
-- Indexes for table `damage_reports`
--
ALTER TABLE `damage_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `borrow_id` (`borrow_id`),
  ADD KEY `reported_by` (`reported_by`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`donation_id`),
  ADD KEY `received_by` (`received_by`);

--
-- Indexes for table `donation_items`
--
ALTER TABLE `donation_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `donation_id` (`donation_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `library_entries`
--
ALTER TABLE `library_entries`
  ADD PRIMARY KEY (`entry_id`);

--
-- Indexes for table `library_settings`
--
ALTER TABLE `library_settings`
  ADD PRIMARY KEY (`setting_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `membership_type_id` (`membership_type_id`);

--
-- Indexes for table `membership_types`
--
ALTER TABLE `membership_types`
  ADD PRIMARY KEY (`membership_type_id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_logs_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `borrow_records`
--
ALTER TABLE `borrow_records`
  MODIFY `borrow_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `damage_reports`
--
ALTER TABLE `damage_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `donation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `donation_items`
--
ALTER TABLE `donation_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `library_entries`
--
ALTER TABLE `library_entries`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `membership_types`
--
ALTER TABLE `membership_types`
  MODIFY `membership_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=434;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD CONSTRAINT `borrow_records_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`),
  ADD CONSTRAINT `borrow_records_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  ADD CONSTRAINT `borrow_records_ibfk_3` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `damage_reports`
--
ALTER TABLE `damage_reports`
  ADD CONSTRAINT `fk_damage_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_damage_borrow` FOREIGN KEY (`borrow_id`) REFERENCES `borrow_records` (`borrow_id`),
  ADD CONSTRAINT `fk_damage_reporter` FOREIGN KEY (`reported_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `donation_items`
--
ALTER TABLE `donation_items`
  ADD CONSTRAINT `fk_donation_items_donation` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`donation_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE;

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`membership_type_id`) REFERENCES `membership_types` (`membership_type_id`);

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
