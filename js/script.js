  document.addEventListener('DOMContentLoaded', function() {
  // Update year in footer
  var year = new Date().getFullYear();
  var yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = year;
  }

  // Modal logic
  const modal = document.getElementById('success-modal');
  const closeModalBtn = modal.querySelector('.modal-close');

  function showModal() {
    modal.classList.add('visible');
  }

  function hideModal() {
    modal.classList.remove('visible');
  }

  // Handle form submission
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    const policyCheckbox = document.getElementById('policy-agree');
    const policyGroup = document.querySelector('.policy-check');

    const submitButton = orderForm.querySelector('button[type="submit"]');
    // initial state
    if (policyCheckbox && submitButton) {
      submitButton.disabled = !policyCheckbox.checked;
    }

    // Toggle submit availability + remove error highlight
    if (policyCheckbox) {
      policyCheckbox.addEventListener('change', function () {
        if (submitButton) submitButton.disabled = !this.checked;
        if (this.checked) {
          policyGroup.classList.remove('error');
        }
      });
    }


    orderForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      // validate policy agreement
      if (policyCheckbox && !policyCheckbox.checked) {
        policyGroup.classList.add('error');
        policyCheckbox.focus();
        return;
      }

      const submitButton = orderForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = 'Отправка...';

      const URL_API = 'api/send-telegram.php'; // Путь к нашему PHP-обработчику

      const formData = new FormData(orderForm);
      const data = Object.fromEntries(formData.entries());

      // Map reason value to Russian label
      let reasonText = data.reason || 'Не указан';
      const reasonSelect = orderForm.querySelector('#reason');
      if (reasonSelect) {
        reasonText = reasonSelect.options[reasonSelect.selectedIndex].textContent;
      }

      let message = `<b>🔥 Новый заказ на песню!</b>\n\n`;
      message += `<b>Повод:</b> ${reasonText}\n`;
      message += `<b>Для кого:</b> ${data.recipient || 'Не указан'}\n`;
      message += `<b>Упомянуть имя:</b> ${data['use-name'] === 'yes' ? 'Да' : 'Нет'}\n`;
      if (data.name) message += `<b>Имя:</b> ${data.name}\n`;
      if (data.mood) message += `<b>Настроение:</b> ${data.mood}\n`;
      if (data.genre) message += `<b>Стиль/жанр:</b> ${data.genre}\n`;
      message += `<b>Текст песни:</b> ${data['use-own-text'] === 'yes' ? 'Написать самим' : 'Свой текст'}\n`;
      if (data.lyrics) message += `<b>Свой текст:</b>\n${data.lyrics}\n`;
      message += `<b>Факты и истории:</b>\n${data.facts}\n\n`;

      if (data['contact-method'] === 'whatsapp') {
        message += `<b>Способ связи:</b> WhatsApp\n`;
        message += `<b>Номер:</b> ${data['contact-phone'] || 'Не указан'}\n`;
      } else {
        message += `<b>Способ связи:</b> Telegram\n`;
        message += `<b>Username:</b> ${data['contact-telegram'] || 'Не указан'}\n`;
      }

      try {
        const response = await fetch(URL_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: message }) // Отправляем объект с ключом 'message'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при отправке в Telegram');
        }

        // Отправка события в Яндекс.Метрику при успешной отправке заявки
        if (typeof ym !== 'undefined') {
          ym(104739398, 'reachGoal', 'lead');
        }

      } catch (error) {
        console.error(error);
        alert('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        showModal();
        orderForm.reset();
      }
    });
  }







  // Scroll-to-top button
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      const show = window.scrollY > 400;
      scrollBtn.classList.toggle('visible', show);
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Close modal events
  if (modal) {
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        hideModal();
      }
    });
  }

  // Contact method switching logic
  const contactMethodRadios = document.querySelectorAll('input[name="contact-method"]');
  const whatsappGroup = document.getElementById('whatsapp-group');
  const telegramGroup = document.getElementById('telegram-group');
  const whatsappInput = document.getElementById('contact-phone');
  const telegramInput = document.getElementById('contact-telegram');

  contactMethodRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'whatsapp') {
        whatsappGroup.classList.remove('hidden');
        telegramGroup.classList.add('hidden');
        whatsappInput.required = true;
        telegramInput.required = false;
      } else {
        whatsappGroup.classList.add('hidden');
        telegramGroup.classList.remove('hidden');
        whatsappInput.required = false;
        telegramInput.required = true;
      }
    });
  });

  // Phone mask for WhatsApp input
  if (whatsappInput) {
    const phoneMask = IMask(whatsappInput, {
      mask: '+{7} (000) 000-00-00'
    });
  }
});
