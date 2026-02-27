USE smart_library;

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS calculate_late_fee(IN tx_id INT, OUT days_late INT, OUT fine_amount DECIMAL(10,2))
BEGIN
  DECLARE d_due DATE;
  DECLARE d_return DATE;

  SELECT due_date, IFNULL(return_date, CURDATE()) INTO d_due, d_return
  FROM transactions
  WHERE id = tx_id;

  SET days_late = GREATEST(DATEDIFF(d_return, d_due), 0);
  SET fine_amount = days_late * 5;
END $$

DELIMITER ;