const fs = require('fs');
const csv = require('fast-csv');

const transactions = [
  { id: 1, date: '2025-10-01', customer_id: 101, employee_id: 1, payment_id: 10, total_amount: 150.0 },
  { id: 2, date: '2025-10-02', customer_id: 102, employee_id: 2, payment_id: 11, total_amount: 250.0 }
];

const transactionDetails = [
  { transaction_detail_key: 1, transaction_id: 1, product_id: 201, quantity: 2, unit_price: 50.0 },
  { transaction_detail_key: 2, transaction_id: 1, product_id: 202, quantity: 1, unit_price: 50.0 },
  { transaction_detail_key: 3, transaction_id: 2, product_id: 203, quantity: 5, unit_price: 50.0 }
];

const customers = [
  { customer_key: 1, customer_id: 101, name: 'Raiqa', email: 'raiqa@example.com', phone: '081111', gender: 'F', join_date: '2024-05-01' },
  { customer_key: 2, customer_id: 102, name: 'Alza', email: 'alza@example.com', phone: '082222', gender: 'M', join_date: '2024-06-15' }
];

const employees = [
  { employee_key: 1, employee_id: 1, employee_name: 'Zegar', position: 'Cashier', hire_date: '2023-01-10' },
  { employee_key: 2, employee_id: 2, employee_name: 'Nathan', position: 'Sales', hire_date: '2022-03-12' }
];

const products = [
  { product_key: 1, product_id: 201, product_name: 'Serum', category_name: 'Skincare', category_description: 'Brightening serum', supplier_name: 'BeautyLab', supplier_contact: '081234', supplier_address: 'Jakarta', current_price: 50.0 },
  { product_key: 2, product_id: 202, product_name: 'Moisturizer', category_name: 'Skincare', category_description: 'Hydrating cream', supplier_name: 'GlowCo', supplier_contact: '082345', supplier_address: 'Bandung', current_price: 50.0 },
  { product_key: 3, product_id: 203, product_name: 'Toner', category_name: 'Skincare', category_description: 'Refreshing toner', supplier_name: 'PureSkin', supplier_contact: '083456', supplier_address: 'Surabaya', current_price: 50.0 }
];

const payments = [
  { payment_key: 10, payment_method: 'Cash', payment_status: 'Paid' },
  { payment_key: 11, payment_method: 'Credit Card', payment_status: 'Paid' }
];

// Dim Date
const dimDate = [...new Set(transactions.map(t => t.date))].map((date, idx) => {
  const d = new Date(date);
  return {
    date_key: idx + 1,
    full_date: date,
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    month_name: d.toLocaleString('default', { month: 'long' }),
    quarter: Math.ceil((d.getMonth() + 1) / 3),
    day_of_week: d.toLocaleString('default', { weekday: 'long' }),
    is_weekend: d.getDay() === 0 || d.getDay() === 6
  };
});

// Fact Sales
const factSales = transactionDetails.map(td => {
  const trans = transactions.find(t => t.id === td.transaction_id);
  return {
    transaction_detail_key: td.transaction_detail_key,
    date_key: dimDate.find(dd => dd.full_date === trans.date).date_key,
    customer_key: customers.find(c => c.customer_id === trans.customer_id).customer_key,
    employee_key: employees.find(e => e.employee_id === trans.employee_id).employee_key,
    product_key: products.find(p => p.product_id === td.product_id).product_key,
    payment_key: trans.payment_id,
    transaction_id: td.transaction_id,
    quantity: td.quantity,
    unit_price: td.unit_price,
    subtotal: td.quantity * td.unit_price,
    total_amount: trans.total_amount,
    transaction_count: 1
  };
});

const outputDir = './etl_output';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function exportCSV(filename, data) {
  const ws = fs.createWriteStream(`${outputDir}/${filename}.csv`);
  csv.write(data, { headers: true }).pipe(ws);
  console.log(`✅ ${filename}.csv created`);
}

exportCSV('dim_date', dimDate);
exportCSV('dim_customer', customers);
exportCSV('dim_employee', employees);
exportCSV('dim_product', products);
exportCSV('dim_payment', payments);
exportCSV('fact_sales', factSales);
