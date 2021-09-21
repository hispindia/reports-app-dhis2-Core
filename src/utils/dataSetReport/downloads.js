export const tableToExcel = (function() {
    var uri = 'data:application/vnd.ms-excel;base64,',
        template =
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>{container}</html>',
        base64 = function(s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        },
        format = function(s, c) {
            return s.replace(/{(\w+)}/g, function(m, p) {
                return c[p]
            })
        }
    return function(container, name, filename) {
        if (!container.nodeType)
            container = document.getElementById(container).srcdoc;
        var ctx = { worksheet: name || 'Worksheet', container: container }
        const anchor = document.createElement('a')
        anchor.href = uri + base64(format(template, ctx))
        anchor.download = filename
        anchor.click()
    }
})()


export const  printContent = (el) => {
    var content = document.getElementById(el).srcdoc;
    document.body.innerHTML = content;
    window.print();
    window.location.reload();
}
