function removeDiacritics(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}
function filterArticles(query) {
    const listItems = document.querySelectorAll('#articlesList li');
    const normalizedQuery = removeDiacritics(query.toLowerCase());

    listItems.forEach(item => {
        const articleDesc = item.textContent;
        const normalizedDesc = removeDiacritics(articleDesc.toLowerCase());

        if (normalizedDesc.includes(normalizedQuery)) {
            item.style.display = ''; // mostrar elemento
        } else {
            item.style.display = 'none'; // esconder elemento
        }
    });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value;
    filterArticles(query);
});
document.getElementById('goToCommand').addEventListener('click', function() {
    window.scrollTo(0,document.body.scrollHeight);
});
document.getElementById('copyButton').addEventListener('click', function() {
    const textarea = document.getElementById('command');
    textarea.select();
    document.execCommand('copy');
});

function getSanctionTotal() {
    let totalSanction = 0;
    const selectedItems = document.querySelectorAll('li.bg-white');

    selectedItems.forEach(item => {
        const sanction = item.getAttribute('data-sancion');
        if (sanction && !isNaN(parseInt(sanction))) {
            totalSanction += parseInt(sanction);
        }
    });

    return totalSanction;
}

function updateCommand() {
    const commandElem = document.getElementById('command');
    const selectedItems = document.querySelectorAll('li.bg-white');
    const totalSanction = getSanctionTotal();
    
    let commandText = `?warn\nTotal: ${totalSanction} €`;

    selectedItems.forEach(item => {
        commandText += `\n${item.innerText.trim()}`;
    });

    commandElem.textContent = commandText;
}

document.addEventListener('DOMContentLoaded', function() {
    const listItems = document.querySelectorAll('li');

    listItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('bg-white')) {
                e.target.classList.remove('bg-white');
            } else {
                e.target.classList.add('bg-white');
            }

            updateCommand();
        });
    });
});
