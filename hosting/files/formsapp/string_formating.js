
//Convert DB fieldname to nice visual

function formatFieldname(name){
  // Sometimes names can arrive as numbers so always convert names to string first.  
   return String(name).replace(/[\._]/g,' ');
 }


 function toDateTime(myDate) {
    /*If you want just dates not times, cut this shorter and change the HTML
     MDB uses DateTimes always internlly*/
     if(myDate == null) return "";
    if (!myDate instanceof Date) return "";
    /* Return ISO String truncated at seconds*/
    const dtString = myDate.toISOString().substring(0, 19);
    return dtString
  }
  
