function doGet(e) {
  var dashboardData = getDashboardData();
  var output = ContentService.createTextOutput(dashboardData);
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function createUID(type, voucher, rowIndex) {
  var cleanVoucher = String(voucher).trim().replace(/[^a-zA-Z0-9]/g, '');
  return type + "_" + cleanVoucher + "_R" + rowIndex;
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);

    // --- บันทึก Payment Due ---
    if (payload.action === 'savePayment') {
      var sheet = getSheetFlexible(ss, "PaymentDue");
      if (!sheet) {
        sheet = ss.insertSheet("PaymentDue");
        sheet.appendRow(["UID", "Voucher", "SuppStatus", "SuppDueDate", "SuppPaidDate", "SuppEmail", "CustStatus", "CustDueDate", "CustPaidDate", "CustEmail", "IsCleared"]);
        sheet.getRange("A1:K1").setFontWeight("bold").setBackground("#f3f4f6");
      }

      var uid = payload.uid;
      var voucher = payload.voucherRaw;
      var pData = payload.data;

      var dataRange = sheet.getDataRange().getValues();
      var foundRow = -1;
      for (var i = 1; i < dataRange.length; i++) {
        if (String(dataRange[i][0]) === String(uid)) { foundRow = i + 1; break; }
      }

      var rowData = [
        voucher,
        pData.suppStatus, pData.suppDueDate, pData.suppPaidDate, pData.suppEmail,
        pData.custStatus, pData.custDueDate, pData.custPaidDate, pData.custEmail,
        pData.isCleared || false
      ];

      if (foundRow > -1) {
        sheet.getRange(foundRow, 2, 1, 10).setValues([rowData]);
      } else {
        sheet.appendRow([uid].concat(rowData));
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- บันทึก Manual Yearly Data ---
    if (payload.action === 'saveManualYearly') {
      var manualSheet = getSheetFlexible(ss, "ManualYearly");
      if (!manualSheet) {
        manualSheet = ss.insertSheet("ManualYearly");
        manualSheet.appendRow(["month", "tourProfit", "hotelProfit", "totalOnly"]);
        manualSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#e0e7ff");
      }

      var entries = payload.entries || [];
      entries.forEach(function(entry) {
        if (!entry.month) return;
        var sheetData = manualSheet.getDataRange().getValues();
        var foundRow = -1;
        for (var i = 1; i < sheetData.length; i++) {
          if (String(sheetData[i][0]).trim() === String(entry.month).trim()) {
            foundRow = i + 1;
            break;
          }
        }
        if (foundRow > -1) {
          manualSheet.getRange(foundRow, 2, 1, 3).setValues([[
            entry.tourProfit || 0,
            entry.hotelProfit || 0,
            entry.totalOnly != null ? entry.totalOnly : ''
          ]]);
          if ((entry.tourProfit || 0) === 0 && (entry.hotelProfit || 0) === 0 && !entry.totalOnly) {
            manualSheet.deleteRow(foundRow);
          }
        } else if ((entry.tourProfit || 0) !== 0 || (entry.hotelProfit || 0) !== 0 || entry.totalOnly) {
          var newRowNum = manualSheet.getLastRow() + 1;
          manualSheet.getRange(newRowNum, 1).setNumberFormat('@STRING@');
          manualSheet.getRange(newRowNum, 1, 1, 4).setValues([[
            entry.month,
            entry.tourProfit || 0,
            entry.hotelProfit || 0,
            entry.totalOnly || ''
          ]]);
        }
      });

      var lastRow = manualSheet.getLastRow();
      if (lastRow > 2) {
        manualSheet.getRange(2, 1, lastRow - 1, 4).sort(1);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- ลบ Manual Yearly รายเดือน ---
    if (payload.action === 'deleteManualYearly') {
      var manualSheet = getSheetFlexible(ss, "ManualYearly");
      if (manualSheet) {
        var month = String(payload.month).trim();
        var sheetData = manualSheet.getDataRange().getValues();
        for (var i = sheetData.length - 1; i >= 1; i--) {
          if (String(sheetData[i][0]).trim() === month) {
            manualSheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- บันทึก Accounting Data ---
    if (payload.action === 'saveAccounting') {
      var result = saveAccountingEntries(ss, payload.entries || []);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetFlexible(ss, targetName) {
  var sheets = ss.getSheets();
  var target = targetName.toLowerCase().replace(/[\s_]/g, '');
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase().replace(/[\s_]/g, '') === target) return sheets[i];
  }
  return null;
}

function parseNum(val) {
  if (val === null || val === undefined || val === "") return 0;
  var str = String(val).replace(/,/g, '').trim();
  var num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function formatYearMonth(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM");
  }
  return String(val).trim();
}

function getFormattedDate(val) {
  if (!val) return null;
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var str = String(val).trim();
  var parts = str.split("/");
  if (parts.length === 3) {
    var d = parts[0].padStart(2, '0');
    var m = parts[1].padStart(2, '0');
    var y = parts[2];
    if (y.length === 4) return y + "-" + m + "-" + d;
  }
  return null;
}

function getAccountingData(ss) {
  var sheet = getSheetFlexible(ss, "AccountingData");
  if (!sheet || sheet.getLastRow() < 2) return {};

  var rows = sheet.getDataRange().getValues();
  var headers = rows[0].map(function(h) { return String(h).trim(); });
  var col = function(name) { return headers.indexOf(name); };
  var colYearMonth = col('YearMonth');
  var colS1 = col('Salary_1');
  var colS2 = col('Salary_2');
  var colS3 = col('Salary_3');
  var colSSO = col('SSO');
  var colVAT = col('VAT');
  var colOther = col('OtherCost');
  var colNote = col('Note');

  if (colYearMonth < 0) return {};

  var data = {};
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var month = formatYearMonth(row[colYearMonth]);
    if (!month || month.toUpperCase() === 'TOTAL' || !/^20\d{2}-\d{2}$/.test(month)) continue;

    var salary1 = parseNum(row[colS1]);
    var salary2 = parseNum(row[colS2]);
    var salary3 = parseNum(row[colS3]);

    data[month] = {
      salary: salary1 + salary2 + salary3,
      salary1: salary1,
      salary2: salary2,
      salary3: salary3,
      socialSec: parseNum(row[colSSO]),
      vat: parseNum(row[colVAT]),
      others: parseNum(row[colOther]),
      othersDesc: colNote >= 0 ? String(row[colNote] || '') : ''
    };
  }
  return data;
}

function saveAccountingEntries(ss, entries) {
  var sheet = getSheetFlexible(ss, "AccountingData");
  if (!sheet) throw new Error('AccountingData sheet not found');

  var rows = sheet.getDataRange().getValues();
  var headers = rows.length ? rows[0].map(function(h) { return String(h).trim(); }) : [];
  var col = function(name) { return headers.indexOf(name); };
  var colYearMonth = col('YearMonth');
  var colS1 = col('Salary_1');
  var colS2 = col('Salary_2');
  var colS3 = col('Salary_3');
  var colSSO = col('SSO');
  var colVAT = col('VAT');
  var colOther = col('OtherCost');
  var colNote = col('Note');

  if (colYearMonth < 0) throw new Error('YearMonth column not found');

  var monthRowMap = {};
  for (var i = 1; i < rows.length; i++) {
    var month = formatYearMonth(rows[i][colYearMonth]);
    if (month && /^20\d{2}-\d{2}$/.test(month)) monthRowMap[month] = i + 1;
  }

  entries.forEach(function(entry) {
    var month = String(entry.month || '').trim();
    if (!month) return;

    var salary = parseNum(entry.salary);
    var socialSec = parseNum(entry.socialSec);
    var vat = parseNum(entry.vat);
    var others = parseNum(entry.others);
    var othersDesc = entry.othersDesc || '';

    var rowNum = monthRowMap[month];
    if (!rowNum) {
      rowNum = sheet.getLastRow() + 1;
      monthRowMap[month] = rowNum;
      sheet.getRange(rowNum, colYearMonth + 1).setNumberFormat('@STRING@');
      sheet.getRange(rowNum, colYearMonth + 1).setValue(month);
    }

    if (colS1 >= 0) sheet.getRange(rowNum, colS1 + 1).setValue(salary);
    if (colS2 >= 0) sheet.getRange(rowNum, colS2 + 1).setValue(0);
    if (colS3 >= 0) sheet.getRange(rowNum, colS3 + 1).setValue(0);
    if (colSSO >= 0) sheet.getRange(rowNum, colSSO + 1).setValue(socialSec);
    if (colVAT >= 0) sheet.getRange(rowNum, colVAT + 1).setValue(vat);
    if (colOther >= 0) sheet.getRange(rowNum, colOther + 1).setValue(others);
    if (colNote >= 0) sheet.getRange(rowNum, colNote + 1).setValue(othersDesc);
  });

  return { status: 'success' };
}

function getDashboardData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.flush();

  var today = new Date();
  var currentYearStr = String(today.getFullYear());
  var currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
  var currentYM = currentYearStr + "-" + currentMonthStr;

  var monthNames = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  var currentMonthText = "รายรับเดือน" + monthNames[today.getMonth() + 1] + " อัปเดต " + today.getDate() + " " + monthNames[today.getMonth() + 1];

  var dashboardData = {
    currentMonthText: currentMonthText,
    currentMonthValue: currentYM,
    overview: { tourOnly: 0, hotelOnly: 0 },
    themeParks: { fantasea: { initialQuota: 183, used: 0 }, carnivalMagic: { initialQuota: 1200, used: 0 } },
    yearlyReport: [],
    manualYearlyData: {},
    accountingData: {},
    dailyOps: { tours: [], hotels: [] },
    paymentList: []
  };

  // --- ดึง Manual Yearly Data ---
  var manualSheet = getSheetFlexible(ss, "ManualYearly");
  if (manualSheet && manualSheet.getLastRow() > 1) {
    var manualRows = manualSheet.getDataRange().getValues();
    for (var i = 1; i < manualRows.length; i++) {
      var mMonthRaw = manualRows[i][0];
      var mMonth = (mMonthRaw instanceof Date)
        ? Utilities.formatDate(mMonthRaw, Session.getScriptTimeZone(), "yyyy-MM")
        : String(mMonthRaw).trim();
      if (/^20\d{2}-\d{2}$/.test(mMonth)) {
        dashboardData.manualYearlyData[mMonth] = {
          tourProfit: parseNum(manualRows[i][1]),
          hotelProfit: parseNum(manualRows[i][2]),
          totalOnly: manualRows[i][3] !== '' && manualRows[i][3] != null ? parseNum(manualRows[i][3]) : null
        };
      }
    }
  }

  // --- ดึง Accounting Data ---
  dashboardData.accountingData = getAccountingData(ss);

  // --- ดึงข้อมูล PaymentDue ---
  var savedPayments = {};
  var paymentSheet = getSheetFlexible(ss, "PaymentDue");
  if (paymentSheet) {
    var pData = paymentSheet.getDataRange().getValues();
    for (var i = 1; i < pData.length; i++) {
      var uidKey = String(pData[i][0]).trim();
      if (uidKey) {
        savedPayments[uidKey] = {
          suppStatus: pData[i][2] || "Unpaid",
          suppDueDate: pData[i][3] ? getFormattedDate(pData[i][3]) : "",
          suppPaidDate: pData[i][4] ? getFormattedDate(pData[i][4]) : "",
          suppEmail: pData[i][5] === true || pData[i][5] === "TRUE",
          custStatus: pData[i][6] || "Unpaid",
          custDueDate: pData[i][7] ? getFormattedDate(pData[i][7]) : "",
          custPaidDate: pData[i][8] ? getFormattedDate(pData[i][8]) : "",
          custEmail: pData[i][9] === true || pData[i][9] === "TRUE",
          isCleared: pData[i][10] === true || pData[i][10] === "TRUE" || String(pData[i][10]).toLowerCase() === "true"
        };
      }
    }
  }

  // --- ดึง Yearly Report ---
  var yearlySheet = getSheetFlexible(ss, "YearlyReport");
  if (yearlySheet) {
    var data = yearlySheet.getDataRange().getDisplayValues();
    for (var i = 0; i < data.length; i++) {
      var monthStr = String(data[i][0]).trim();
      if (/^20\d{2}-\d{2}$/.test(monthStr)) {
        var tourP = parseNum(data[i][1]);
        var hotelP = parseNum(data[i][2]);
        dashboardData.yearlyReport.push({ month: monthStr, tourProfit: tourP, hotelProfit: hotelP, totalProfit: tourP + hotelP });
        if (monthStr === currentYM) {
          dashboardData.overview.tourOnly = tourP;
          dashboardData.overview.hotelOnly = hotelP;
        }
      }
    }
  }

  // --- ดึง Theme Park ---
  var themeSheet = getSheetFlexible(ss, "ThemeParkReport");
  if (themeSheet) {
    dashboardData.themeParks.fantasea.initialQuota = parseNum(themeSheet.getRange("C3").getValue()) || 183;
    dashboardData.themeParks.fantasea.used = parseNum(themeSheet.getRange("C5").getValue());
    dashboardData.themeParks.carnivalMagic.initialQuota = parseNum(themeSheet.getRange("O3").getValue()) || 1200;
    dashboardData.themeParks.carnivalMagic.used = parseNum(themeSheet.getRange("O5").getValue());
  }

  // --- ดึงข้อมูลทัวร์ ---
  var tour26Sheet = getSheetFlexible(ss, "Tour26");
  if (tour26Sheet) {
    var tourData = tour26Sheet.getDataRange().getValues();
    for (var i = 1; i < tourData.length; i++) {
      var voucherRaw = String(tourData[i][0] || "").trim();
      if (!voucherRaw) continue;

      var uid = createUID("T", voucherRaw, i);
      var savedP = savedPayments[uid];
      var isUnpaid = !savedP || (savedP.suppStatus !== "Paid" || savedP.custStatus !== "Paid");

      var rowYM = String(tourData[i][25] || "").trim();
      if (!/^20\d{2}-\d{2}$/.test(rowYM)) rowYM = String(tourData[i][24] || "").trim();

      if (rowYM && rowYM < currentYM && !isUnpaid) continue;

      var tourDate = tourData[i][9];
      var fDate = getFormattedDate(tourDate);
      var vLast3 = voucherRaw.length >= 3 ? voucherRaw.slice(-3) : voucherRaw;

      var tObj = {
        uid: uid,
        voucherRaw: voucherRaw,
        voucher: vLast3,
        customer: String(tourData[i][2] || ""),
        tourName: String(tourData[i][11] || ""),
        companyName: String(tourData[i][12] || ""),
        pickupTime: String(tourData[i][16] || ""),
        service: String(tourData[i][11] || ""),
        agent: String(tourData[i][7] || ""),
        type: 'Tour',
        dateStr: fDate || "",
        serviceDate: fDate || rowYM || ""
      };

      if (fDate) dashboardData.dailyOps.tours.push(tObj);

      savedP = savedP || { suppStatus: "Unpaid", suppDueDate: "", suppPaidDate: "", suppEmail: false, custStatus: "Unpaid", custDueDate: "", custPaidDate: "", custEmail: false, isCleared: false };
      dashboardData.paymentList.push(Object.assign({}, tObj, savedP));
    }
  }

  // --- ดึงข้อมูลโรงแรม ---
  var hotel26Sheet = getSheetFlexible(ss, "Hotel26");
  if (hotel26Sheet) {
    var hotelData = hotel26Sheet.getDataRange().getValues();
    for (var i = 1; i < hotelData.length; i++) {
      var voucherRawH = String(hotelData[i][0] || "").trim();
      if (!voucherRawH) continue;

      var uidH = createUID("H", voucherRawH, i);
      var savedPH = savedPayments[uidH];
      var isUnpaidH = !savedPH || (savedPH.suppStatus !== "Paid" || savedPH.custStatus !== "Paid");

      var rowYMH = String(hotelData[i][23] || "").trim();
      if (!/^20\d{2}-\d{2}$/.test(rowYMH)) rowYMH = String(hotelData[i][24] || "").trim();

      if (rowYMH && rowYMH < currentYM && !isUnpaidH) continue;

      var stayDateStr = String(hotelData[i][9] || "").trim();
      var fDateH = null;
      if (stayDateStr) {
        var checkInStr = stayDateStr.split("-")[0].trim();
        fDateH = getFormattedDate(checkInStr);
      }

      var vLast3H = voucherRawH.length >= 3 ? voucherRawH.slice(-3) : voucherRawH;

      var hObj = {
        uid: uidH,
        voucherRaw: voucherRawH,
        voucher: vLast3H,
        customer: String(hotelData[i][2] || ""),
        hotelName: String(hotelData[i][10] || ""),
        service: String(hotelData[i][10] || ""),
        stayDate: stayDateStr,
        agent: String(hotelData[i][7] || ""),
        type: 'Hotel',
        dateStr: fDateH || "",
        serviceDate: fDateH || rowYMH || ""
      };

      if (fDateH) dashboardData.dailyOps.hotels.push(hObj);

      savedPH = savedPH || { suppStatus: "Unpaid", suppDueDate: "", suppPaidDate: "", suppEmail: false, custStatus: "Unpaid", custDueDate: "", custPaidDate: "", custEmail: false, isCleared: false };
      dashboardData.paymentList.push(Object.assign({}, hObj, savedPH));
    }
  }

  return JSON.stringify(dashboardData);
}

function checkAndSendEmailReminders() {
  var sheet = getSheetFlexible(SpreadsheetApp.getActiveSpreadsheet(), "PaymentDue");
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  var tomorrowStr = Utilities.formatDate(tomorrow, Session.getScriptTimeZone(), "yyyy-MM-dd");

  var suppAlerts = [];
  var custAlerts = [];

  for (var i = 1; i < data.length; i++) {
    var voucher = String(data[i][1]).trim();
    var isCleared = data[i][10];
    if (isCleared === true || isCleared === "TRUE" || String(isCleared).toLowerCase() === "true") continue;

    var suppStatus = String(data[i][2]).trim();
    var suppDueDateRaw = data[i][3];
    var suppDueDate = getFormattedDate(suppDueDateRaw);
    var suppEmailFlag = data[i][5] === true || data[i][5] === "TRUE";

    var custStatus = String(data[i][6]).trim();
    var custDueDateRaw = data[i][7];
    var custDueDate = getFormattedDate(custDueDateRaw);
    var custEmailFlag = data[i][9] === true || data[i][9] === "TRUE";

    function checkIsOverdueOrTomorrow(dueDateStr, rawDate) {
      if (!dueDateStr) return false;
      var due = new Date(rawDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() <= tomorrow.getTime();
    }

    if (suppStatus !== "Paid" && suppEmailFlag && checkIsOverdueOrTomorrow(suppDueDate, suppDueDateRaw)) {
      suppAlerts.push("<li><b>Voucher: " + voucher + "</b> - กำหนดชำระ: " + suppDueDate + " <span style='color:red;'>(ถึงกำหนด/เลยกำหนดแล้ว)</span></li>");
    }
    if (custStatus !== "Paid" && custEmailFlag && checkIsOverdueOrTomorrow(custDueDate, custDueDateRaw)) {
      custAlerts.push("<li><b>Voucher: " + voucher + "</b> - กำหนดรับเงิน: " + custDueDate + " <span style='color:red;'>(ถึงกำหนด/เลยกำหนดแล้ว)</span></li>");
    }
  }

  if (suppAlerts.length > 0 || custAlerts.length > 0) {
    var emailBody = "<h2>🔔 แจ้งเตือนรายการ Payment Due ประจำวัน</h2>";
    emailBody += "<p>สรุปรายการที่ถึงกำหนดชำระเงิน และรายการรอรับเงินจากลูกค้า</p>";
    if (suppAlerts.length > 0) {
      emailBody += "<h3 style='color:#2563eb;'>1. รายการค้างชำระ Supplier (Supplier Due)</h3>";
      emailBody += "<div style='background-color:#eff6ff; padding:15px; border-radius:8px;'><ul>" + suppAlerts.join("") + "</ul></div>";
    }
    if (custAlerts.length > 0) {
      emailBody += "<h3 style='color:#ea580c;'>2. รายการรอรับเงินลูกค้า (Customer Due)</h3>";
      emailBody += "<div style='background-color:#fff7ed; padding:15px; border-radius:8px;'><ul>" + custAlerts.join("") + "</ul></div>";
    }
    emailBody += "<br><p>กรุณาตรวจสอบรายละเอียดแบบเต็มได้ในระบบ <a href='https://hala-db.vercel.app' target='_blank'>Executive Dashboard</a></p>";

    MailApp.sendEmail({
      to: "admin@halawallatour.com",
      subject: "🔔 HALA WALLA SYSTEM Payment Due: แจ้งเตือนรายการประจำวัน",
      htmlBody: emailBody
    });
  }
}
