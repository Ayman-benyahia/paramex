window.addEventListener('DOMContentLoaded', (event) => {

    const syncInputs = (sourceNode, targetNode) => {
        let sourceInputs = sourceNode.querySelectorAll('input[type="hidden"][name]');

        for(let sourceInput of sourceInputs) {
            let targetInput = targetNode.querySelector(`[name="${sourceInput.name}"]`);
            if(!targetInput) continue;

            if(targetInput.matches('select')) {
                for(let i = 0; i < targetInput.options.length; i++) {
                    let option = targetInput.options[i];
                    if(option.value === sourceInput.value) {
                        targetInput.selectedIndex = i;
                        break;
                    }
                }
                continue;
            }

            if(targetInput.matches('input[type="checkbox"], input[type="radio"]')) { 
                targetInput.checked = sourceInput.value;
                continue;
            } 

            targetInput.value = sourceInput.value;
        }        
    };

    const clearInputs = (node) => {
        let inputs = node.querySelectorAll('input, select, textarea');

        for(let input of inputs) {
            if(input.matches('select')) {
                input.selectedIndex = 0;
                continue;
            }

            if(input.matches('input[type="checkbox"], input[type="radio"]')) {
                input.checked = false;
                continue;
            } 

            input.value = '';
        }
    }


    // "Search-Bar"
    /***************************************************************************/

    (() => {
        let searchBar = document.querySelector(`#searchBar`);
        let searchBar_input = searchBar.querySelector(`#searchBar-input`);

        searchBar_input.addEventListener('input', debounce((event) => {
            let currentUrl = new URL(location.href);
            currentUrl.searchParams.set('search', searchBar_input.value);
            currentUrl.searchParams.set('page', '0');
            window.location.href = currentUrl;
        }, 400));
    })();


    // "Tags"
    /***************************************************************************/

    (() => {
        let archiveTag = document.querySelector('#archiveTag');
        let trashTag   = document.querySelector('#trashTag');

        archiveTag.addEventListener('click', (event) => {
            let currentUrl = new URL(location.href);
            currentUrl.searchParams.set('archive', (archiveTag.checked) ? '1' : '0');
            window.location.href = currentUrl;
        });

        trashTag.addEventListener('click', (event) => {
            let currentUrl = new URL(location.href);
            currentUrl.searchParams.set('trash', trashTag.checked ? '1' : '0');
            window.location.href = currentUrl;
        });
    })();

    // "Add Entry Modal"
    /***************************************************************************/

    (() => {
        let modal = document.querySelector('#addEntryModal');
        if(!modal) return;
        
        let modalComponent = new bootstrap.Modal(modal);
        let modalTrigger = document.querySelector('#addEntryModalTrigger');

        modalTrigger.addEventListener('click', (event) => {
            modalComponent.show();
        });

        modal.addEventListener('hide.bs.modal', (event) => {
            clearInputs(modal);
        });
    })();

    
    // "Edit Entry Modal"
    /***************************************************************************/

    (() => {
        let modal = document.querySelector('#editEntryModal');
        if(!modal) return;

        let modalComponent = new bootstrap.Modal(modal);
        let tableau = document.querySelector('table');

        tableau.addEventListener('click', (event) => {
            if(!event.target.matches('[name="editEntryModalTrigger"], [name="editEntryModalTrigger"] *')) return;

            let tableRow = event.target.closest('tr');
            syncInputs(tableRow, modal);

            modalComponent.show();
        });

        modal.addEventListener('hide.bs.modal', (event) => {
            clearInputs(modal);
        });
    })();


    // "Remove Entry Modal"
    /***************************************************************************/

    (() => {
        let modal = document.querySelector('#removeEntryModal');
        let modal_idInput = document.querySelector('#removeEntryModal-idInput');
        let modal_designationOutput = document.querySelector('#removeEntryModal-designationOutput');
        let modalComponent = new bootstrap.Modal(modal);
        let tableau = document.querySelector(`table`);

        tableau.addEventListener('click', (event) => {
            if(!event.target.matches(`[name="removeEntryModalTrigger"], [name="removeEntryModalTrigger"] *`)) return;
            
            let tableRow = event.target.closest('tr');
            let tableRow_idInput = tableRow.querySelector('input[name="id"]');
            let tableRow_designationInput = tableRow.querySelector('input[name="designation"]');

            modal_idInput.value = tableRow_idInput.value;
            modal_designationOutput.textContent = tableRow_designationInput.value;

            modalComponent.show();
        });

        modal.addEventListener('hide.bs.modal', (event) => {
            modal_idInput.value = '';
            modal_designationOutput.textContent = '';
        });
    })();
});