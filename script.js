// Data Storage
let salesData = JSON.parse(localStorage.getItem('salesData')) || [];
let creditData = JSON.parse(localStorage.getItem('creditData')) || [];

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const salesForm = document.getElementById('salesForm');
const creditForm = document.getElementById('creditForm');
const salesTableBody = document.getElementById('salesTableBody');
const creditTableBody = document.getElementById('creditTableBody');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const previewBtn = document.getElementById('previewBtn');
const btnClear = document.querySelector('.btn-clear');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDateFields();
    setupEventListeners();
    updateDashboard();
    renderSalesTable();
    renderCreditTable();
    updateCurrentDate();
    setInterval(updateCurrentDate, 1000);
});

// Update current date
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const now = new Date().toLocaleDateString('pt-BR', options);
    document.getElementById('currentDate').textContent = now;
}

// Initialize date fields
function initializeDateFields() {
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('reportStartDate')) {
        document.getElementById('reportStartDate').value = today;
        document.getElementById('reportEndDate').value = today;
    }
    if (document.getElementById('creditDueDate')) {
        document.getElementById('creditDueDate').value = today;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Form submissions
    salesForm.addEventListener('submit', handleSaleSubmit);
    creditForm.addEventListener('submit', handleCreditSubmit);

    // Report buttons
    generatePdfBtn.addEventListener('click', generatePDF);
    previewBtn.addEventListener('click', previewReport);

    // Clear data
    btnClear.addEventListener('click', clearAllData);
}

// Switch tabs
function switchTab(tabName) {
    navButtons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-btn').classList.add('active');

    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

// Handle sale submission
function handleSaleSubmit(e) {
    e.preventDefault();

    const sale = {
        id: Date.now(),
        product: document.getElementById('productName').value,
        customer: document.getElementById('customerName').value || 'Sem cliente',
        amount: parseFloat(document.getElementById('saleAmount').value),
        payment: document.getElementById('paymentType').value,
        date: new Date().toLocaleDateString('pt-BR')
    };

    salesData.push(sale);
    localStorage.setItem('salesData', JSON.stringify(salesData));

    addActivity(`💰 Venda registrada: ${sale.product} - R$ ${sale.amount.toFixed(2)}`);
    renderSalesTable();
    updateDashboard();
    salesForm.reset();

    showNotification('✅ Venda registrada com sucesso!');
}

// Handle credit submission
function handleCreditSubmit(e) {
    e.preventDefault();

    const credit = {
        id: Date.now(),
        customer: document.getElementById('creditCustomer').value,
        contact: document.getElementById('creditContact').value,
        description: document.getElementById('creditDescription').value,
        amount: parseFloat(document.getElementById('creditAmount').value),
        dueDate: document.getElementById('creditDueDate').value,
        status: 'pending',
        registeredDate: new Date().toLocaleDateString('pt-BR')
    };

    creditData.push(credit);
    localStorage.setItem('creditData', JSON.stringify(creditData));

    addActivity(`📝 Fiado registrado: ${credit.customer} - R$ ${credit.amount.toFixed(2)}`);
    renderCreditTable();
    updateDashboard();
    creditForm.reset();

    showNotification('✅ Fiado registrado com sucesso!');
}

// Render sales table
function renderSalesTable() {
    const noSalesMsg = document.getElementById('noSalesMsg');
    const tableContainer = document.getElementById('salesTableContainer');

    if (salesData.length === 0) {
        tableContainer.style.display = 'none';
        noSalesMsg.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    noSalesMsg.style.display = 'none';

    salesTableBody.innerHTML = salesData.map((sale, index) => `
        <tr>
            <td>${sale.product}</td>
            <td>${sale.customer}</td>
            <td>R$ ${sale.amount.toFixed(2)}</td>
            <td>${getPaymentLabel(sale.payment)}</td>
            <td>${sale.date}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteSale(${index})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Render credit table
function renderCreditTable() {
    const noCreditMsg = document.getElementById('noCreditMsg');
    const tableContainer = document.getElementById('creditTableContainer');

    if (creditData.length === 0) {
        tableContainer.style.display = 'none';
        noCreditMsg.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    noCreditMsg.style.display = 'none';

    creditTableBody.innerHTML = creditData.map((credit, index) => `
        <tr>
            <td>${credit.customer}</td>
            <td>${credit.contact}</td>
            <td>${credit.description}</td>
            <td>R$ ${credit.amount.toFixed(2)}</td>
            <td>${credit.dueDate}</td>
            <td>
                <span class="badge badge-${getStatusClass(credit.dueDate)}">
                    ${getStatusLabel(credit.dueDate)}
                </span>
            </td>
            <td>
                <button class="btn btn-success" onclick="markAsPaid(${index})">✓</button>
                <button class="btn btn-danger" onclick="deleteCredit(${index})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Delete sale
function deleteSale(index) {
    if (confirm('Tem certeza que deseja deletar esta venda?')) {
        salesData.splice(index, 1);
        localStorage.setItem('salesData', JSON.stringify(salesData));
        renderSalesTable();
        updateDashboard();
        showNotification('❌ Venda removida');
    }
}

// Delete credit
function deleteCredit(index) {
    if (confirm('Tem certeza que deseja deletar este fiado?')) {
        creditData.splice(index, 1);
        localStorage.setItem('creditData', JSON.stringify(creditData));
        renderCreditTable();
        updateDashboard();
        showNotification('❌ Fiado removido');
    }
}

// Mark credit as paid
function markAsPaid(index) {
    creditData[index].status = 'paid';
    localStorage.setItem('creditData', JSON.stringify(creditData));
    renderCreditTable();
    updateDashboard();
    showNotification('✅ Marcado como pago!');
}

// Update dashboard
function updateDashboard() {
    const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    const totalCredit = creditData.reduce((sum, credit) => sum + (credit.status === 'pending' ? credit.amount : 0), 0);
    const uniqueCustomers = new Set(creditData.map(c => c.customer)).size;
    const totalTransactions = salesData.length + creditData.length;

    document.getElementById('totalSales').textContent = `R$ ${totalSales.toFixed(2)}`;
    document.getElementById('totalCredit').textContent = `R$ ${totalCredit.toFixed(2)}`;
    document.getElementById('totalCustomers').textContent = uniqueCustomers;
    document.getElementById('totalTransactions').textContent = totalTransactions;

    updateActivityList();
}

// Activity list
function addActivity(message) {
    const activity = {
        message,
        time: new Date().toLocaleTimeString('pt-BR')
    };

    const activityList = JSON.parse(localStorage.getItem('activities')) || [];
    activityList.unshift(activity);
    if (activityList.length > 10) activityList.pop();
    localStorage.setItem('activities', JSON.stringify(activityList));
}

function updateActivityList() {
    const activityList = JSON.parse(localStorage.getItem('activities')) || [];
    const container = document.getElementById('activityList');

    if (activityList.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma atividade registrada</p>';
        return;
    }

    container.innerHTML = activityList.map(activity => `
        <div class="activity-item">
            <p>${activity.message}</p>
            <p class="time">${activity.time}</p>
        </div>
    `).join('');
}

// Generate PDF
function generatePDF() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;

    const filteredSales = salesData.filter(sale => {
        const saleDate = new Date(sale.date.split('/').reverse().join('-'));
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });

    const filteredCredits = creditData.filter(credit => {
        const creditDate = new Date(credit.dueDate);
        return creditDate >= new Date(startDate) && creditDate <= new Date(endDate);
    });

    const element = document.createElement('div');
    element.innerHTML = generateReportHTML(filteredSales, filteredCredits, startDate, endDate);

    const opt = {
        margin: 10,
        filename: `relatorio_vendas_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
    showNotification('📥 PDF gerado com sucesso!');
}

// Preview report
function previewReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;

    const filteredSales = salesData.filter(sale => {
        const saleDate = new Date(sale.date.split('/').reverse().join('-'));
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });

    const filteredCredits = creditData.filter(credit => {
        const creditDate = new Date(credit.dueDate);
        return creditDate >= new Date(startDate) && creditDate <= new Date(endDate);
    });

    document.getElementById('reportContent').innerHTML = generateReportHTML(filteredSales, filteredCredits, startDate, endDate);
    document.getElementById('reportPreview').classList.remove('hidden');
}

// Generate report HTML
function generateReportHTML(sales, credits, startDate, endDate) {
    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0);

    return `
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .report-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ec4899; padding-bottom: 20px; }
            .report-header h1 { color: #ec4899; margin: 0; }
            .report-header p { margin: 5px 0; color: #666; }
            .report-section { margin: 30px 0; }
            .report-section h2 { color: #ec4899; border-bottom: 2px solid #fce7f3; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #ec4899; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) { background: #fce7f3; }
            .summary { background: #fce7f3; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .summary-item { display: flex; justify-content: space-between; margin: 10px 0; }
            .total { font-weight: bold; font-size: 18px; color: #ec4899; }
        </style>

        <div class="report-header">
            <h1>🎀 SHADAY STORE</h1>
            <p>Relatório de Vendas</p>
            <p>Período: ${startDate} a ${endDate}</p>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <div class="report-section">
            <h2>📊 Resumo Executivo</h2>
            <div class="summary">
                <div class="summary-item">
                    <span>Total de Vendas:</span>
                    <span class="total">R$ ${totalSales.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Total de Fiados:</span>
                    <span class="total">R$ ${totalCredits.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Quantidade de Vendas:</span>
                    <span class="total">${sales.length}</span>
                </div>
                <div class="summary-item">
                    <span>Quantidade de Fiados:</span>
                    <span class="total">${credits.length}</span>
                </div>
            </div>
        </div>

        <div class="report-section">
            <h2>💰 Vendas Registradas</h2>
            ${sales.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Pagamento</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(sale => `
                            <tr>
                                <td>${sale.product}</td>
                                <td>${sale.customer}</td>
                                <td>R$ ${sale.amount.toFixed(2)}</td>
                                <td>${getPaymentLabel(sale.payment)}</td>
                                <td>${sale.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>Nenhuma venda no período</p>'}
        </div>

        <div class="report-section">
            <h2>📝 Fiados Registrados</h2>
            ${credits.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${credits.map(credit => `
                            <tr>
                                <td>${credit.customer}</td>
                                <td>${credit.description}</td>
                                <td>R$ ${credit.amount.toFixed(2)}</td>
                                <td>${credit.dueDate}</td>
                                <td>${getStatusLabel(credit.dueDate)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>Nenhum fiado no período</p>'}
        </div>

        <div class="report-section" style="text-align: center; margin-top: 50px; border-top: 2px solid #ec4899; padding-top: 20px;">
            <p>Documento gerado automaticamente pelo sistema Shaday Store</p>
        </div>
    `;
}

// Helper functions
function getPaymentLabel(payment) {
    const labels = { money: 'Dinheiro', card: 'Cartão', pix: 'Pix' };
    return labels[payment] || payment;
}

function getStatusLabel(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today ? 'Vencido' : 'Pendente';
}

function getStatusClass(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today ? 'overdue' : 'pending';
}

function showNotification(message) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ec4899, #f43f5e);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
        animation: slideInRight 0.3s ease-out;
        z-index: 1000;
    `;
    document.body.appendChild(div);

    setTimeout(() => {
        div.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

function clearAllData() {
    if (confirm('⚠️ Tem certeza? Esta ação não pode ser desfeita!')) {
        localStorage.clear();
        location.reload();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
