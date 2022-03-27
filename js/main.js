const url = '../docs/pdf.pdf'
var _OBJECT_URL;
document.querySelector("#upload-dialog").addEventListener('click', function() {
    document.querySelector("#pdf-file").click();
});
document.querySelector("#pdf-file").addEventListener('change', function() {
    // user selected PDF
    var file = this.files[0];

    // allowed MIME types
    var mime_types = [ 'application/pdf' ];
    
    // validate whether PDF
    if(mime_types.indexOf(file.type) == -1) {
        alert('Error : Incorrect file type');
        return;
    }

    // validate file size
    if(file.size > 10*1024*1024) {
        alert('Error : Exceeded size 10MB');
        return;
    }

    // validation is successful

    // hide upload dialog
    document.querySelector("#upload-dialog").style.display = 'none';
    document.querySelector('#refresh').style.display = 'inline-block'
    
    // // show the PDF preview loader
    // document.querySelector("#pdf-loader").style.display = 'inline-block';

    // object url of PDF 
    _OBJECT_URL = URL.createObjectURL(file)

    // // send the object url of the pdf to the PDF preview function
    // showPDF(_OBJECT_URL);
    loadpage(_OBJECT_URL)
});


let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null

    const scale = 1.5,
        canvas = document.querySelector('#pdf-render'),
        ctx = canvas.getContext('2d')
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("PDF Preview", canvas.width/2, canvas.height/2);

    const renderPage = num => {
            pageIsRendering = true

            pdfDoc.getPage(num).then(page => {
                
                const viewport = page.getViewport({scale})
                canvas.height = viewport.height
                canvas.width = viewport.width

                const renderCtx = {
                    canvasContext: ctx,
                    viewport
                }

                page.render(renderCtx).promise.then(()=> {
                    pageIsRendering = false;

                    if(pageNumIsPending !== null)
                    {
                        renderPage(pageNumIsPending)
                        pageNumIsPending = null
                    }
                })
                document.querySelector('#page-info').style.display = 'block'
                document.querySelector('#page-num').textContent = num
            })
    }

    const queueRenderPage = num => {
        if(pageIsRendering){
            pageNumIsPending = num;
        }
        else{
            renderPage(num)
        }
    }

    const showPrevPage = () => {
        if(pageNum <= 1){
            return
        }
        pageNum--
        queueRenderPage(pageNum)
    }
    const showNextPage = () => {
        if(pageNum >= pdfDoc.numPages){
            return
        }
        pageNum++
        queueRenderPage(pageNum)
    }
    function loadpage(pdf_url) {
        pdfjsLib.getDocument(pdf_url).promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_
    
    
            document.querySelector('#page-count').textContent = pdfDoc.numPages;
    
            renderPage(pageNum)
        })
    }
    

    document.querySelector('#prev-page').addEventListener('click', showPrevPage)
    document.querySelector('#next-page').addEventListener('click', showNextPage)
    document.querySelector('#refresh').addEventListener('click', ()=>{
        location.reload()
    })