
function chatScriptFunction() {
  document.querySelector('.chat[data-chat=person2]')?.classList.add('active-chat')
  document.querySelector('.person[data-chat=person2]')?.classList.add('active')

  let friends = {
      list: document.querySelector('ul.people'),
      all: document.querySelectorAll('.left .person'),
      name: ''
    },
    chat = {
      main: document.querySelector('.main .right'),
      current: null,
      person: null,
      name: document.querySelector('.main .right .top .name')
    }

  friends.all.forEach(f => {
    f.addEventListener('mousedown', () => {
      f.classList?.contains('active') || setAciveChat(f)
    })
  });

  function setAciveChat(f) {
    friends.list.querySelector('.active')?.classList.remove('active')
    f.classList.add('active')
    chat.current = chat.main.querySelector('.active-chat')
    chat.person = f.getAttribute('data-chat')
    chat.current?.classList?.remove('active-chat')
    chat.main.querySelector('[data-chat="' + chat.person + '"]')?.classList.add('active-chat')
    friends.name = f.querySelector('.name')?.innerText
    chat.name.innerHTML = friends.name
  }

}
