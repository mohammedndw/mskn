const fs = require('fs');
const path = require('path');

class DocumentGenerator {
  /**
   * Generate contract document in HTML format
   * @param {Object} contractData - Contract data including property, tenant, owner info
   * @returns {string} - Path to generated document
   */
  generateContractDocument(contractData) {
    const {
      contract,
      property,
      tenant,
      owner
    } = contractData;

    // Handle null owner with default values
    const safeOwner = owner || {
      firstName: 'N/A',
      lastName: '',
      email: 'N/A',
      phone: 'N/A'
    };

    // Handle null estate with default values (property may not have an estate)
    const safeEstate = property.estate || {
      name: 'N/A',
      city: property.city || 'N/A',
      region: property.region || 'N/A',
      address: property.street || property.district || 'N/A'
    };

    // Ensure documents directory exists
    const docsDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = `contract_${contract.id}_${timestamp}.html`;
    const filepath = path.join(docsDir, filename);

    // Format dates
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2
      }).format(amount);
    };

    // Calculate contract duration
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const durationMonths = Math.ceil(durationDays / 30);

    // Generate HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rental Contract - ${contract.id}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .terms {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 20px 0;
        }
        .terms ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .terms li {
            margin-bottom: 8px;
        }
        .signatures {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .signature-block {
            border-top: 2px solid #333;
            padding-top: 10px;
        }
        .signature-block p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RENTAL CONTRACT AGREEMENT</h1>
        <p>Contract ID: ${contract.id}</p>
        <p>Date Generated: ${formatDate(new Date())}</p>
    </div>

    <div class="section">
        <div class="section-title">PROPERTY INFORMATION</div>
        <div class="info-grid">
            <div class="info-label">Property Name:</div>
            <div class="info-value">${property.name}</div>

            <div class="info-label">Property Type:</div>
            <div class="info-value">${property.type}</div>

            <div class="info-label">Location:</div>
            <div class="info-value">${safeEstate.name}, ${safeEstate.city}, ${safeEstate.region}</div>

            <div class="info-label">Address:</div>
            <div class="info-value">${safeEstate.address}</div>

            ${property.bedrooms ? `
            <div class="info-label">Bedrooms:</div>
            <div class="info-value">${property.bedrooms}</div>
            ` : ''}

            ${property.bathrooms ? `
            <div class="info-label">Bathrooms:</div>
            <div class="info-value">${property.bathrooms}</div>
            ` : ''}

            ${property.area ? `
            <div class="info-label">Area:</div>
            <div class="info-value">${property.area} sqm</div>
            ` : ''}
        </div>
    </div>

    <div class="section">
        <div class="section-title">TENANT INFORMATION</div>
        <div class="info-grid">
            <div class="info-label">Full Name:</div>
            <div class="info-value">${tenant.firstName} ${tenant.lastName}</div>

            <div class="info-label">National ID:</div>
            <div class="info-value">${tenant.nationalId}</div>

            <div class="info-label">Email:</div>
            <div class="info-value">${tenant.email}</div>

            <div class="info-label">Phone:</div>
            <div class="info-value">${tenant.phone}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">OWNER INFORMATION</div>
        <div class="info-grid">
            <div class="info-label">Full Name:</div>
            <div class="info-value">${safeOwner.firstName} ${safeOwner.lastName}</div>

            <div class="info-label">Email:</div>
            <div class="info-value">${safeOwner.email}</div>

            <div class="info-label">Phone:</div>
            <div class="info-value">${safeOwner.phone}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">CONTRACT TERMS</div>
        <div class="info-grid">
            <div class="info-label">Start Date:</div>
            <div class="info-value">${formatDate(contract.startDate)}</div>

            <div class="info-label">End Date:</div>
            <div class="info-value">${formatDate(contract.endDate)}</div>

            <div class="info-label">Duration:</div>
            <div class="info-value">${durationMonths} months (${durationDays} days)</div>

            <div class="info-label">Rental Amount:</div>
            <div class="info-value">${formatCurrency(contract.price)}</div>

            <div class="info-label">Payment Frequency:</div>
            <div class="info-value">${{
              'MONTHLY': 'Monthly',
              'QUARTERLY': 'Quarterly',
              'SEMI_ANNUALLY': 'Semi-Annually',
              'ANNUALLY': 'Annually'
            }[contract.paymentFrequency] || contract.paymentFrequency}</div>
        </div>
    </div>

    <div class="terms">
        <div class="section-title">TERMS AND CONDITIONS</div>
        <ol>
            <li>The tenant agrees to pay the rental amount as specified in this contract.</li>
            <li>The tenant is responsible for maintaining the property in good condition.</li>
            <li>The tenant shall not sublease the property without written consent from the owner.</li>
            <li>The owner is responsible for major repairs and maintenance of the property structure.</li>
            <li>The tenant must notify the owner immediately of any damages or required repairs.</li>
            <li>Either party may terminate this contract with 30 days written notice, subject to applicable laws.</li>
            <li>Upon termination, the tenant agrees to return the property in the same condition as received, normal wear and tear excepted.</li>
            <li>This contract is governed by the laws of Saudi Arabia.</li>
        </ol>
    </div>

    <div class="signatures">
        <div class="signature-block">
            <p><strong>TENANT SIGNATURE</strong></p>
            <p>${tenant.firstName} ${tenant.lastName}</p>
            <p>National ID: ${tenant.nationalId}</p>
            <p>Date: _________________</p>
            <p>Signature: _________________</p>
        </div>
        <div class="signature-block">
            <p><strong>OWNER SIGNATURE</strong></p>
            <p>${safeOwner.firstName} ${safeOwner.lastName}</p>
            <p>Date: _________________</p>
            <p>Signature: _________________</p>
        </div>
    </div>

    <div class="footer">
        <p>This is a legally binding contract. Both parties should retain a copy for their records.</p>
        <p>Generated by Property Management System on ${formatDate(new Date())}</p>
    </div>
</body>
</html>
    `;

    // Write file
    fs.writeFileSync(filepath, htmlContent, 'utf8');

    // Return relative URL
    return `/uploads/documents/${filename}`;
  }
}

module.exports = new DocumentGenerator();
