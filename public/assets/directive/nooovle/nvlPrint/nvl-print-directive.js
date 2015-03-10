/**
 * Created by juancarlos.yu on 3/8/15.
 */
angular
    .module("module.directives")
    .directive("nvlPrint", [
                   nvlPrint
               ]);

function nvlPrint() {
    var printSection = document.getElementById('printSection');

    if (!printSection) {
        printSection = document.createElement('div');
        printSection.id = 'printSection';
        document.body.appendChild(printSection);
    }

    function printElement(element) {
        var domClone = element.cloneNode(true);
        while(printSection.firstChild) {
            printSection.removeChild(printSection.firstChild);
        }
        printSection.appendChild(domClone);
    }

    function link(scope, element, attrs) {
        element.on('click', onClick);
        window.onafterprint = cleanUp;

        function onClick() {
            var elementToPrint = document.getElementById(attrs.printableId);
            if (elementToPrint) {
                printElement(elementToPrint);
                window.print();
            }
        }

        function cleanUp() {
            printSection.innerHtml = '';
        }
    }

    return {
        link     : link,
        restrict : 'A'
    }
}
