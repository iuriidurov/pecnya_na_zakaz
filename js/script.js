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
    orderForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      const submitButton = orderForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = 'Отправка...';

      const TOKEN = "8004634051:AAEMd4Pz-4y3pcoP67Nsaa6LoY4Xkbqwgrw";
      const CHAT_ID = "-1002581153952";
      const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

      const formData = new FormData(orderForm);
      const data = Object.fromEntries(formData.entries());

      let message = `<b>🔥 Новый заказ на песню!</b>\n\n`;
      message += `<b>Повод:</b> ${data.reason || 'Не указан'}\n`;
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
          body: JSON.stringify({
            chat_id: CHAT_ID,
            parse_mode: 'html',
            text: message
          })
        });

        if (!response.ok) {
          throw new Error('Ошибка при отправке в Telegram');
        }

      } catch (error) {
        console.error(error);
        alert('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        showModal();
        orderForm.reset();
      }
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
