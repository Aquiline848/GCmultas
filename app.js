function removeDiacritics(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}
function removeNaNFromText(text) {
    return text.replace(/ \(NaN\)/g, '');
}
function removeDuplicateSanctions(text) {

    return text.replace(/: (\d+ ?€): \1/g, ': $1');
}
function quitarCoso(text) {
    const regex = /\s€ar usuario: razon:/;
    return text.replace(regex, '');
}

function filterArticles(query) {
    const listItems = document.querySelectorAll('#articlesList li');
    const normalizedQuery = removeDiacritics(query.toLowerCase());

    listItems.forEach(item => {
        const articleDesc = item.textContent;
        const normalizedDesc = removeDiacritics(articleDesc.toLowerCase());

        if (normalizedDesc.includes(normalizedQuery)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}



document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value;
    filterArticles(query);
});
document.getElementById('goToCommand').addEventListener('click', function () {
    window.scrollTo(0, document.body.scrollHeight);
});
document.getElementById('copyButton').addEventListener('click', function () {
    const textarea = document.getElementById('command');
    textarea.select();
    document.execCommand('copy');
});
const userEnteredSanctions = new Map(); // Usamos un Map para un mejor seguimiento

function getSanctionValue(item) {
    const sanctionText = item.getAttribute('data-sancion');
    const itemId = item.id;

    // Verificamos si ya se ingresó un valor para este artículo
    if (userEnteredSanctions.has(itemId)) {
        return userEnteredSanctions.get(itemId);
    }

    // Expresión regular mejorada para detectar un rango de sanción y permitir texto adicional entre el rango y el "€"
    const rangeRegex = /(\d+)\s*-\s*(\d+)\s*€/;

    let rangeMatch = sanctionText.match(rangeRegex);
    let sanctionValue = 0;

    if (rangeMatch) {
        let minValue = parseFloat(rangeMatch[1]);
        let maxValue = parseFloat(rangeMatch[2]);

        // Solicitar al usuario que ingrese un valor dentro del rango
        let userInput = prompt(`Ingrese una cantidad entre ${minValue} y ${maxValue}:`, '');
        if (userInput !== null) {
            let inputValue = parseFloat(userInput);
            if (!isNaN(inputValue) && inputValue >= minValue && inputValue <= maxValue) {
                sanctionValue = inputValue;
                userEnteredSanctions.set(itemId, sanctionValue); // Almacenamos el valor introducido
            } else {
                alert(`Debe ingresar un valor válido entre ${minValue} y ${maxValue}.`);
                return getSanctionValue(item); // Reintentar si la entrada es inválida
            }
        } else {
            // Si el usuario cancela, decide qué hacer. Aquí simplemente regresamos 0.
            sanctionValue = 0;
        }
    } else {
        // Si no es un rango, se maneja como un valor fijo
        sanctionValue = parseFloat(sanctionText.replace('€', '').trim());
        userEnteredSanctions.set(itemId, sanctionValue); // Almacenamos el valor fijo
    }

    return sanctionValue;
}


function getSanctionTotal() {
    let totalSanction = 0;
    const selectedItems = document.querySelectorAll('li.bg-white');

    selectedItems.forEach(item => {
        const value = getSanctionValue(item);
        if (value !== null) {
            totalSanction += value;
        }
    });

    return totalSanction;
}

function updateCommand() {
    const commandElem = document.getElementById('command');
    const arrestReportElem = document.getElementById('arrestReport');
    const totalMultaElem = document.getElementById('totalMulta');
    const razonElem = document.getElementById('razon');

    let selectedItems = Array.from(document.querySelectorAll('li.bg-white'));

    selectedItems.sort((a, b) => a.innerText.trim().localeCompare(b.innerText.trim()));

    let totalSanction = 0;
    let totalSinPrefijo = 0;
    let totalConPrefijo = 0;
    let articulosDeArresto = [];
    let commandText = "/multar usuario: razon:";

    selectedItems.forEach(item => {
        const sanctionValue = getSanctionValue(item);
        totalSanction += sanctionValue;

        let modifiedText = item.innerText.trim();
        if (item.innerText.includes('Tráfico de drogas') ||
            item.innerText.includes('Posesión de estupefacientes') ||
            item.innerText.includes('Tráfico de personas') ||
            item.innerText.includes('Tráfico de menores')) {

            modifiedText = `${modifiedText} (${sanctionValue} €)`;
        }

        const splitText = modifiedText.split(':');
        if (splitText.length > 2) {
            commandText += `\n${splitText[0]}: ${sanctionValue} €`;
        } else {
            commandText += `\n${modifiedText}`;
        }

        if (item.innerText.startsWith("art-1")) {
            totalConPrefijo += sanctionValue;
        } else {
            totalSinPrefijo += sanctionValue;
        }

        articulosDeArresto.push(modifiedText);
    });

    commandText = `/multar usuario: razon:\nTotal: ${totalSanction} €` + commandText.substr(5);
    commandElem.textContent = quitarCoso(commandText);

    if (totalSinPrefijo > 1000 || totalConPrefijo > 2000) {
        arrestReportElem.classList.remove('hidden');
        totalMultaElem.textContent = totalSanction;
        razonElem.innerHTML = '<br>' + articulosDeArresto.join('<br>');
    } else {
        arrestReportElem.classList.add('hidden');
    }
}



document.addEventListener('DOMContentLoaded', function () {
    const listItems = document.querySelectorAll('li');

    listItems.forEach(item => {
        item.addEventListener('click', function (e) {
            if (e.target.classList.contains('bg-white')) {
                e.target.classList.remove('bg-white');
            } else {
                e.target.classList.add('bg-white');
            }

            updateCommand();
        });
    });
});
