/* Functions specific to the listview

/* Register a component to record it's width, apply any saved width*/

function watchColumnResizing(element) {
    //If we have a stored size for this column apply it
    const fieldname = element.id; //Record the size for a given label
    const docTypeName = vueApp.selectedDocType.namespace;
    const storedWidth = localStorage.getItem(`${docTypeName}_${fieldname}`)
    if (storedWidth) {
        element.style.width = storedWidth
    }
    vueApp.columnResizeObserver.observe(element)
}



//This is client side sorting but more complex than you might expect
//Needs to cope with any data type
function sortListviewColumn(column) {


    vueApp.results.sort((a, b) => {
        let value_a = getFieldValue(a, column);
        let value_b = getFieldValue(b, column);

        //If these are different types sort by typename
        if (typeof value_a != typeof value_b) { a_type = typeof value_a; return a_type.localeCompare(typeof value_b) }
        //Try a numeric comparison, works for dates etc too.
        if (isNaN(value_a - value_b) == false) { return value_a - value_b; } //Comparison worked;
        //Last option, compare as strings
        return `${value_a}`.localeCompare(`${value_b}`);
    })

    //If we sorted by this column last time, then reverse the order
    if (vueApp.lastSortColumn == column) {
        vueApp.results.reverse();
        vueApp.lastSortColumn = null;
    } else {
        vueApp.lastSortColumn = column;
    }
}


function onListviewColumnResize(columns) {
    for (let column of columns) {
        //Grab the width from the style and record it in localstorage
        const width = column.target.style.width;
        const fieldname = column.target.id; //Record the size for a given label
        const docTypeName = vueApp.selectedDocType.namespace;
        localStorage.setItem(`${docTypeName}_${fieldname}`, width);
    }
}