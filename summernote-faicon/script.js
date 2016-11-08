$(document).ready(function() {
  $("#summernote").summernote({
						toolbar: [
								['style', ['style']],
								['font1', ['bold', 'italic', 'clear']],
								['font2', ['strikethrough', 'superscript', 'subscript']],
								['para', ['ul', 'ol', 'paragraph', 'quote', 'clearer']],
								['insert', ['link', 'picture',  'hr', 'video', 'faicon']],
								['table', ['table']],
								['view', ['fullscreen', 'codeview', 'help']]
							]
    
  });

  $("body").append("<p>load ok...</p>");
});
