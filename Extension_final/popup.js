// popup.js

// Function to create a table row
function createTableForHeaderRequest(key, value) {
    //console.log("table value" + key + " value: " + value);
    const row = document.createElement("tr");

    // Create table cells
    const nameCell = document.createElement("td");
    nameCell.textContent = key;
    row.appendChild(nameCell);

    const valuecell = document.createElement("td");
    valuecell.textContent = value;
    row.appendChild(valuecell);

    return row;
}

// function to create a table header
function populateTableHeaders(items) {
    const row = document.createElement("tr");

    items.forEach((item) => {
        const cell = document.createElement("th");
        cell.textContent = item;
        row.appendChild(cell);
    });

    return row;
}

// Function to populate the table with data
function populateTable() {
        
    // Retrieve data from storage
    chrome.storage.local.get("onbeforesendheaders", (result)=>{
        const headers = result.onbeforesendheaders || [];
        //console.log("Headers: " + JSON.stringify(headers));

        const tableBody = document.querySelector("#dataTable tbody");
        const tableHead = document.querySelector("#dataTable thead");
        
        tableHead.innerHTML = "";
        
        const headItems = ["Property Name", "Value"];
        const hRow = populateTableHeaders(headItems);
        
        tableHead.appendChild(hRow);

        tableBody.innerHTML = "";

        Object.entries(headers).forEach( ([key, value]) => {
            //console.log(`${key} => ${value}`);
            const row = createTableForHeaderRequest(key, value);
            tableBody.appendChild(row);
        });
        document.getElementById('status').innerText = "";
    });
}

// added event listener for button element in popup
document.getElementById("ClearAlert").addEventListener("click", clearAlerts);

function clearAlerts() {
    
    chrome.storage.local.remove("lastIrreleventAlert", () => {
        chrome.action.setBadgeText({ text: "" });
    });
    chrome.storage.local.remove("relevantAlert", ()=> {
        
    });

    chrome.cookies.getAll({ domain: ".google.com" }, (cookies) => {
        for (let cookie of cookies) {
          console.log("Cookie: " + cookie.name + " deleted");
          chrome.cookies.remove({
            url: "https://www.google.com" + cookie.path,
            name: cookie.name
          });
        }
        document.getElementById('status').innerText = "Alerts and Google cookies cleared.";
    });
    
}

// Call the populate function when the popup loads
document.addEventListener("DOMContentLoaded", populateTable);

