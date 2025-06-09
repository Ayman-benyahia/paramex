window.addEventListener('DOMContentLoaded', (event) => {
    let addEntryModal            = document.querySelector('#addEntryModal');
    let editEntryModal           = document.querySelector('#editEntryModal');
    let removeEntryModal         = document.querySelector('#removeEntryModal');
    let addEntryModalInstance    = new bootstrap.Modal(addEntryModal);
    let editEntryModalInstance   = new bootstrap.Modal(editEntryModal);
    let removeEntryModalInstance = new bootstrap.Modal(removeEntryModal);


    // Handle Modals Visibility Using Togglers

    addEntryModalTrigger.addEventListener('click', (event) => {
        addEntryModalInstance.toggle();
    });

    document.body.addEventListener('click', (event) => {
        let target = event.target;
        if(target.matches('#addEntryModalTrigger')) {
            addEntryModalInstance.toggle();
        }
        else if(target.matches('[name="editEntryModalTrigger"]') || 
            target.matches('[name="editEntryModalTrigger"] > *')) {
            editEntryModalInstance.toggle();
        }
        else if(target.matches('[name="removeEntryModalTrigger"]') || 
            target.matches('[name="removeEntryModalTrigger"] > *')) {
            removeEntryModalInstance.toggle();
        }
    });



    // Search behavior when typing on search bar

    let searchBar = document.querySelector('#searchBar');
    searchBar.addEventListener('input', debounce((event) => {
        let currentUrl = new URL(location.href);
        currentUrl.searchParams.set('search', searchBar.value);
        currentUrl.searchParams.set('page', '0');
        window.location.href = currentUrl;
    }, 400));


    
    let tableau = document.querySelector('table');

    // Fill the "Remove Entry Modal" with data from tableau

    tableau.addEventListener('click', (event) => {
        if(!event.target.matches('[name="removeEntryModalTrigger"]') &&
           !event.target.matches('[name="removeEntryModalTrigger"] > *')) {
           return;
        }

        let tr = event.target.closest('tr');
        let id = tr.querySelector('input[name="id"]').value;
        let name = tr.querySelector('input[name="name"]').value;

        removeEntryModal.querySelector('input[name="id"]').value = id;
        removeEntryModal.querySelector('.output').textContent = '"' + name + '"';
    });


    // Fill the "Edit Entry Modal" with data from the tableau

    tableau.addEventListener('click', (event) => {
        if(!event.target.matches('[name="editEntryModalTrigger"]') && 
           !event.target.matches('[name="editEntryModalTrigger"] > *')) {
            return;
        }

        let tr = event.target.closest('tr');
        let id = tr.querySelector('input[name="id"]').value;
        let name = tr.querySelector('input[name="name"]').value;
        
        editEntryModal.querySelector('input[name="id"]').value = id;
        editEntryModal.querySelector('input[name="name"]').value = name;
    });
});