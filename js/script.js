  document.addEventListener('DOMContentLoaded', function() {
  // Update year in footer
  var year = new Date().getFullYear();
  var yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = year;
  }

  // Handle form submission
  var orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', function(event) {
      event.preventDefault();
      alert('Спасибо! Мы свяжемся с вами для демо.');
      // Here you can add code to send form data to a server, e.g., using fetch()
    });
  }
});
