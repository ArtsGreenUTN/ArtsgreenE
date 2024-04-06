function createFooter() {
    return `
      <footer class="text-center text-white" style="background-color: #C8A788;">
        <!-- Grid container -->
        <div class="container p-4">
          <!-- Section: Iframe -->
          <section class="">
            <div class="row d-flex justify-content-center">
              <div class="col-lg-6">
                <div class="ratio ratio-16x9">
                  <iframe
                    class="shadow-1-strong rounded"
                    src="https://www.youtube.com/embed/IvQNZXxuBLY"
                    title="YouTube video"
                    allowfullscreen
                  ></iframe> 
                </div>
              </div>
            </div>
          </section>
          <!-- Section: Iframe -->
        </div>
        <!-- Grid container -->
  
        <!-- Copyright -->
        <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.2);">
          © 2024 Copyright:
          <a class="text-white" href="#">ArtsGreen</a>
        </div>
        <!-- Copyright -->
      </footer>
    `;
  }
  
  // Invoca la función para obtener el HTML del pie de página
  const footerHTML = createFooter();
  
  // Inserta el HTML en el cuerpo del documento
  document.body.insertAdjacentHTML('beforeend', footerHTML);
  