import bcrypt from 'bcryptjs';

const REQUIRED_TABLES = [
  'batches',
  'branches',
  'students',
  'books',
  'transactions',
  'late_fee',
  'ratings',
  'suggestions',
  'library_faq'
];

const TABLE_CREATION_QUERIES = [
  `CREATE TABLE IF NOT EXISTS batches (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_batches_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS branches (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_branches_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS students (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id VARCHAR(30) DEFAULT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    batch_id INT UNSIGNED DEFAULT NULL,
    branch_id INT UNSIGNED DEFAULT NULL,
    year INT,
    role ENUM('admin','student') NOT NULL DEFAULT 'student',
    first_login TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_students_student_id (student_id),
    UNIQUE KEY uq_students_email (email),
    KEY idx_students_batch_id (batch_id),
    KEY idx_students_branch_id (branch_id),
    CONSTRAINT fk_students_batch
      FOREIGN KEY (batch_id) REFERENCES batches(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE,
    CONSTRAINT fk_students_branch
      FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS books (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(120) NOT NULL,
    quantity INT NOT NULL,
    available_quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id INT UNSIGNED NOT NULL,
    book_id INT UNSIGNED NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE DEFAULT NULL,
    status ENUM('issued','returned') NOT NULL DEFAULT 'issued',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_transactions_student_id (student_id),
    KEY idx_transactions_book_id (book_id),
    CONSTRAINT fk_transactions_student
      FOREIGN KEY (student_id) REFERENCES students(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_book
      FOREIGN KEY (book_id) REFERENCES books(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS late_fee (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    transaction_id INT UNSIGNED NOT NULL,
    days_late INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_late_fee_transaction_id (transaction_id),
    KEY idx_late_fee_transaction_id (transaction_id),
    CONSTRAINT fk_late_fee_transaction
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS ratings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id INT UNSIGNED NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ratings_student_id (student_id),
    CONSTRAINT fk_ratings_student
      FOREIGN KEY (student_id) REFERENCES students(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS suggestions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id INT UNSIGNED NOT NULL,
    suggestion VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_suggestions_student_id (student_id),
    CONSTRAINT fk_suggestions_student
      FOREIGN KEY (student_id) REFERENCES students(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS library_faq (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

export const initDatabase = async (pool) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }

  try {
    const [tableRows] = await pool.query(
      `SELECT TABLE_NAME
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    const existingTables = new Set(tableRows.map((row) => row.TABLE_NAME));
    const missingTables = REQUIRED_TABLES.filter((tableName) => !existingTables.has(tableName));

    if (missingTables.length > 0) {
      for (const query of TABLE_CREATION_QUERIES) {
        await pool.query(query);
      }
      console.log('Tables created');
    } else {
      console.log('Tables created (already exist)');
    }
  } catch (error) {
    console.error('Table initialization skipped due to error:', error.message);
  }

  try {
    const [columnRows] = await pool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'students'
         AND COLUMN_NAME = 'student_id'`,
      [process.env.DB_NAME]
    );

    if (columnRows.length === 0) {
      await pool.query('ALTER TABLE students ADD COLUMN student_id VARCHAR(30) NULL');
      await pool.query('ALTER TABLE students ADD UNIQUE KEY uq_students_student_id (student_id)');
      console.log('Tables created');
    }
  } catch (error) {
    console.error('Table migration skipped due to error:', error.message);
  }

  try {
    const [studentCountRows] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const totalStudents = Number(studentCountRows[0]?.total || 0);

    if (totalStudents === 0) {
      await pool.query(
        `INSERT INTO batches (name)
         VALUES (?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        ['2024']
      );

      await pool.query(
        `INSERT INTO branches (name)
         VALUES (?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        ['CSE']
      );

      const [[batch]] = await pool.query('SELECT id FROM batches WHERE name = ?', ['2024']);
      const [[branch]] = await pool.query('SELECT id FROM branches WHERE name = ?', ['CSE']);

      const hashedPassword = await bcrypt.hash('Admin123', 10);

      await pool.query(
        `INSERT INTO students (student_id, name, email, phone, password, batch_id, branch_id, year, role, first_login)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           student_id = VALUES(student_id),
           name = VALUES(name),
           phone = VALUES(phone),
           password = VALUES(password),
           role = VALUES(role),
           first_login = VALUES(first_login)`,
        ['ADM-2024-001', 'Admin', 'admin@gmail.com', '9999999999', hashedPassword, batch?.id || null, branch?.id || null, 4, 'admin', 0]
      );

      console.log('Seed data inserted');
    } else {
      console.log('Seed data inserted (already exists)');
    }
  } catch (error) {
    console.error('Seed initialization skipped due to error:', error.message);
  }

  console.log('Database ready');
};