( async() => {

    const MAX_CONTACTS = 10; // максимальное количество контактов для одного клиента
    const PARENT = document.querySelector('.main__clients-field'); // основное поле списка клиентов
    const SPIN = document.querySelector('.spinner'); // крутилка загрузки
    let editId; // идентификатор id кнопки редактирования и удаления
    let sorted; // переменная для определения сортировки
    const modalAdd = document.getElementById('modalAdd');
    const modalEdit = document.getElementById('modalEdit');
    const modalDelete = document.getElementById('modalDelete');
    let filterResultMassive = []; // создаем массив фильтрации
    localStorage.setItem('toggle', 0);

    // разово загружаем базу данных для экономии ресурсов
    let data = dbGetAllData();
    await data;

    // закрытие модального окна при нажатии ESC
    document.addEventListener('keydown', function (e) {
        if(e.key == 'Escape' && document.body.lastChild.tagName) {
            let modalIdent = document.body.lastChild.querySelector('.modal');
            modalIdent.parentElement.remove();
        }
    });

    // функция получения данных с сервера
    async function dbGetAllData() {
        try {   
            SPIN.style.opacity = '1'; // вкл анимацию загрузки
            let response = await fetch('http://localhost:3000/api/clients');
            data = await response.json();
            SPIN.style.opacity = '0'; // вsкл анимацию загрузки
        } catch(err) {
            // если нет связи с сервером
            let errMessage = document.createElement('p');
            errMessage.classList.add('warning');
            errMessage.textContent = 'Нет связи с сервером, обновите страницу позже или обратитесь к администратору.';
            PARENT.append(errMessage);
            SPIN.style.opacity = '0';
            PARENT.classList.add('flex');
            PARENT.style.alignItems = 'center';
            PARENT.style.justifyContent = 'center';
        }
    }

    // функция поиска в массиве загруженных данных
    function dbGetElement(id, nameToGet) {
        let dataFind = data.find(numb => numb.id === id)[nameToGet];
        if (dataFind) return dataFind;
        else return null;
    }

    // функция исправления фио на заглавные
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // функция очистки таблицы
    function listRemove() {
        PARENT.innerHTML = '';
    }


    // РАБОТА С ГЛАВНЫМ ОКНОМ при первичной загрузке
    // Если есть данные в базе днанных загружаем их в окно клиентов
    function dbLoadClients(bckg) {
        if (data.length == 0) return; // если данных нет - ничего не делаем
        
        // идетифицируем элементы
        const clientSearchInput = document.querySelector('.header__input');
        const clientSortId = document.querySelector('.main__id');
        const clientSortFio = document.querySelector('.main__fio');
        const clientSortDate = document.querySelector('.main__date');
        const clientSortEdit = document.querySelector('.main__edit');
        const clientFilterToggle = document.getElementById('filterToggle');

        let localToggle = localStorage.getItem('toggle');
        if (localToggle == 1) clientFilterToggle.checked = true; // проверям localStorage и устанавливаем тип фильтрации

        let chosenOneId; // устанавливаем переменную id выбранного в поиске клиента


        // Выводим данные клиента из базы данных
        function clientItemFill(data) {
            for(let i = 0; i < data.length; i++) {
                // Создаем элементы строки
                let clientItem = client.cloneNode(true);
                clientItem.id = data[i].id;
                PARENT.append(clientItem);

                // если это клиент из поиска
                if (bckg == i && localStorage.getItem('toggle') == 0) {
                    if (clientSearchInput.value !== '') {
                        clientItem.style.backgroundColor = 'var(--firm_background)'; // меняем фон подсветки
                        setTimeout(() => clientItem.style.backgroundColor = 'initial', 1000); // убираем фон по таймеру
                    }
                    clientSearchInput.value = ''; // очищаем поле ввода
                }

                // Создаем константы полей
                const clientId = clientItem.querySelector('.client-id');
                const clientFio = clientItem.querySelector('.client-fio');
                const clientCreateDate = clientItem.querySelector('.main__client-create-date');
                const clientCreateTime = clientItem.querySelector('.main__client-create-time');
                const clientEditDate = clientItem.querySelector('.main__client-edit-date');
                const clientEditTime = clientItem.querySelector('.main__client-edit-time');
                const clientContacts = clientItem.querySelector('.client-contacts');
                const clientActions = clientItem.querySelector('.client-actions');
                const clientEdit = clientActions.querySelector('.main__client-edit');
                const clientDelete = clientActions.querySelector('.main__client-delete');

                clientEdit.id = i;
                clientDelete.id = i;

                // функция отрисовки иконок контактов
                function iconsCreate(count) {
                    for (let img = count; img < data[i].contacts.length; img++) {
                        let icon = document.createElement('div');
                        icon.classList.add('icon');
                        const iconText = document.createElement('div');
                        iconText.classList.add('icon-text');
                        const iconTextBold = document.createElement('span');
                        iconTextBold.classList.add('icon-text-bold');

                        // если кнтактов больше 4 и это первичная отрисовка
                        if (img == 4 && count == 0) {
                            icon = document.createElement('div');
                            icon.classList.add('icon-empty');
                            icon.textContent = `+${data[i].contacts.length - img}`; // указываем оставшееся количество контактов
                            img = MAX_CONTACTS; //скипаем дальнейшую отрисовку

                        // присвиваем иконки и назначаем всплывающий текст
                        } else {
                            if (data[i].contacts[img].type == 'Телефон') icon.style.backgroundImage = "url('img/contact-phone.svg')";
                            if (data[i].contacts[img].type == 'Email') icon.style.backgroundImage = "url('img/contact-email.svg')";
                            if (data[i].contacts[img].type == 'Vk') icon.style.backgroundImage = "url('img/contact-vk.svg')";
                            if (data[i].contacts[img].type == 'Facebook') icon.style.backgroundImage = "url('img/contact-fb.svg')";
                            if (data[i].contacts[img].type == 'Доп.телефон') icon.style.backgroundImage = "url('img/contact-other.svg')";

                            iconText.textContent = `${data[i].contacts[img].type}: `;
                            iconTextBold.textContent = data[i].contacts[img].value;
                            icon.append(iconText);
                            iconText.append(iconTextBold);
                        }
                        clientContacts.append(icon);
                    }
                }
                iconsCreate(0); // с какой иконки начинать заполнять (0 - первичная отрисовка)
                
                // Заполняем табличные данные клиентов
                clientId.textContent = data[i].id;
                clientId.setAttribute('href', '#' + data[i].id);
                clientFio.textContent = data[i].surname + ` ` + data[i].name + ` ` + data[i].lastName;
                clientCreateDate.textContent = data[i].createdAt.substr(8, 2) + '.' + data[i].createdAt.substr(5, 2) + '.' + data[i].createdAt.substr(0, 4);
                clientCreateTime.textContent = data[i].createdAt.substr(11, 5);
                clientEditDate.textContent = data[i].updatedAt.substr(8, 2) + '.' + data[i].updatedAt.substr(5, 2) + '.' + data[i].updatedAt.substr(0, 4);
                clientEditTime.textContent = data[i].updatedAt.substr(11, 5);

                // Делаем видимыми скопированные блоки
                Object.assign(clientItem.style, {
                    display: "flex"
                });

                // вешаем обработчик на ИЗМЕНЕНИЕ клиента
                clientEdit.onclick = function() {
                    editId = data[clientDelete.id].id; // отмечаем id кнопки 
                    modalOpen(modalEdit); // запускаем функцию открытия модального окна изменения клиента
                }

                // вешаем обработчик на УДАЛЕНИЕ клиента
                clientDelete.onclick = function() {
                    editId = data[clientDelete.id].id; // отмечаем id кнопки 
                    modalOpen(modalDelete); // запускаем функцию открытия модального окна удаления клиента
                }

                // вешаем обработчик на ИКОНКУ скрытой группы иконок
                clientContacts.onclick = function(event) {
                    let clientIconMore = clientContacts.querySelector('.icon-empty');
                    if (event.target == clientIconMore) {
                        clientIconMore.remove();
                        iconsCreate(4);
                    }
                }

                // определяем хэш и открываем соответствующее модальное окно клиента
                window.addEventListener('hashchange',() => {
                    editId = data[clientDelete.id].id; // отмечаем id кнопки 
                    if (`#` + editId == location.hash) modalOpen(modalEdit);
                });
            }
        }
        clientItemFill(data);


        // СОРТИРОВКА

        const up = "url(\"../img/arrow_up.svg\")";
        const down = "url(\"../img/arrow_down.svg\")";
        // функция сортировки
        function sortData(idSort, item, dir) {
            listRemove(); // очищаем список

            // если список уже сортировался, иначе...
            if (dir) {
                if (dir == 'dirUp') data.sort((a, b) => a[item] > b[item] ? 1 : -1);
                if (dir == 'dirDown') data.sort((a, b) => b[item] > a[item] ? 1 : -1);
            } else {
                if (idSort.id == 'down') {
                    data.sort((a, b) => a[item] > b[item] ? 1 : -1);
                    idSort.id = 'up';
                }
                else {
                    data.sort((a, b) => b[item] > a[item] ? 1 : -1);
                    idSort.id = 'down';
                }
            }

            // если список фильтровался
            if (filterResultMassive.length !== 0) {
                // определяем введенный текст, преобразуем его
                let sortInputSearch = () => {
                    let value = clientSearchInput.value;
                    let val = value.trim().toLowerCase().split(/\s+/);
                    let res = data.filter(o => val.some(s => o.name.toLowerCase().includes(s) || o.surname.toLowerCase().includes(s) || o.lastName.toLowerCase().includes(s)));
                    return res;
                };
                filterResultMassive = sortInputSearch(); // присваиваивам фильтрованный массив переменной
                clientItemFill(filterResultMassive);
            } else clientItemFill(data); // если список не фильтровался, берем полный массив
        }

        // переключатель стрелочек
        function sortArrow(idSort) {
            let image = idSort.style.backgroundImage;
            if (image == '' || image == down) {
                if (idSort == clientSortFio) document.querySelector('.sort-dir').textContent = 'А-Я';
                idSort.style.backgroundImage = up;
            }
            else {
                if (idSort == clientSortFio) document.querySelector('.sort-dir').textContent = 'Я-А';
                idSort.style.backgroundImage = down;
            }
            if (image == '' && idSort == clientSortId) idSort.style.backgroundImage = down;
        }

        // идентифицируем сортировку, чтобы выводить ее при изменениях списка
        if (clientSortId == sorted && clientSortId.id == 'down') sortData(clientSortId, 'id', 'dirDown');
        if (clientSortId == sorted && clientSortId.id == 'up') sortData(clientSortId, 'id', 'dirUp');
        if (clientSortFio == sorted && clientSortFio.id == 'down') sortData(clientSortFio, 'surname', 'dirDown');
        if (clientSortFio == sorted && clientSortFio.id == 'up') sortData(clientSortFio, 'surname', 'dirUp');
        if (clientSortDate == sorted && clientSortDate.id == 'down') sortData(clientSortDate, 'createdAt', 'dirDown');
        if (clientSortDate == sorted && clientSortDate.id == 'up') sortData(clientSortDate, 'createdAt', 'dirUp');
        if (clientSortEdit == sorted && clientSortEdit.id == 'down') sortData(clientSortEdit, 'updatedAt', 'dirDown');
        if (clientSortEdit == sorted && clientSortEdit.id == 'up') sortData(clientSortEdit, 'updatedAt', 'dirUp');

        // функция сортировки
        function clientSortFunction(column, columnId) {
            sortArrow(column); // переключаем стрелочку
            sortData(column, columnId);
            sorted = this;
        }
        // вешаем обработчик на сортировку по ID
        clientSortId.onclick = function() {
            clientSortFunction(clientSortId, 'id')
        }

        // вешаем обработчик на сортировку по ФИО
        clientSortFio.onclick = function() {
            clientSortFunction(clientSortFio, 'surname')
        }

        // вешаем обработчик на сортировку по дате СОЗДАНИЯ
        clientSortDate.onclick = function() {
            clientSortFunction(clientSortDate, 'createdAt')
        }

        // вешаем обработчик на сортировку по дате ИЗМЕНЕНИЯ
        clientSortEdit.onclick = function() {
            clientSortFunction(clientSortEdit, 'updatedAt')
        }


        // ФИЛЬТРАЦИЯ и ПОИСК
        // обработчик на переключатель типа фильтрации
        clientFilterToggle.onclick = function() {
            if (!clientFilterToggle.checked) {
                filterResultMassive.length = 0;
                localStorage.setItem('toggle', 0);
                listRemove();
                dbLoadClients();
            } else localStorage.setItem('toggle', 1);
            clientSearchInput.value = '';
        }

        // создание блока выпадающего списка поиска
        const searchBlock = document.getElementById('search')
        const searchResultBlock = document.createElement('div');
        searchResultBlock.classList.add('header__result');

        let timer; // переменная задержки заполнения

        // обработчик ввода текста в поле поиска
        clientSearchInput.oninput = function() {

            let value = clientSearchInput.value; // введенный такст

            // функция преобразования начальных букв ФИО в строчные
            function inputSearch() {
                let val = value.trim().toLowerCase().split(/\s+/);
                let res = data.filter(o => val.some(s => o.name.toLowerCase().includes(s) || o.surname.toLowerCase().includes(s) || o.lastName.toLowerCase().includes(s)));
                return res;
            };
            
            // режим ФИЛЬТРАЦИЯ
            // задержка поиска при вводе текста
            clearTimeout(timer);
            timer = setTimeout(function() {
                if (localStorage.getItem('toggle') == 1) {
                    filterResultMassive = inputSearch();
                    listRemove();
                    clientItemFill(filterResultMassive);
                    // выводим сообщение, если ничего не нашлось
                    if (filterResultMassive.length == 0 && value !== '') {
                        const message = document.createElement('p');
                        message.classList.add('empty-message');
                        PARENT.append (message);
                        message.textContent = 'Отбору не соответствует ни один из клиентов';
                    }
                }
            }, 300, this);

            // режим ПОИСК
            // если включен режим поиска (выбор одного клиента)
            if (!clientFilterToggle.checked) {
                if (value == '') searchResultBlock.remove(); // убираем поле результата, если инпут пустой
                else searchBlock.append(searchResultBlock);
                let resMass = inputSearch();
                searchResultBlock.innerHTML = ''; // каждый ввод очищаем результат
                
                // создаем таблицу с результатами поиска
                for (let i = 0; i < resMass.length; i++) {
                    searchResultBlock.style.opacity = '1';
                    const searchResultItem = document.createElement('div');
                    searchResultItem.classList.add('header__item');
                    searchResultItem.id = resMass[i].id;
                    searchResultBlock.append(searchResultItem);
                    
                    searchResultItem.textContent = resMass[i].surname + ' ' + resMass[i].name + ' ' + resMass[i].lastName;
                }
                // если клик вне поля результатов
                document.addEventListener( 'click', (e) => {
                    let withinBoundaries = e.composedPath().includes(searchResultBlock);
                    if (!withinBoundaries) searchResultBlock.remove(); // скрываем элемент т.к. клик был за его пределами
                })

                // вешаем обработчик на выбранного клиента
                searchResultBlock.onclick = function(event) {
                    let chosenOne = event.target.id;
                    chosenOneId = data.findIndex(el => el.id === chosenOne);
                    listRemove();
                    dbLoadClients(chosenOneId);
                    searchResultBlock.remove();
                    document.getElementById(chosenOneId).scrollIntoView({behavior: "smooth", block: "center", inline: "center"}); // скролл
                    delete chosenOne;
                }
            }
        }
    }
    dbLoadClients();



    // РАБОТА С МОДАЛЬНЫМИ ОКНАМИ

    // если в ссылке есть хэш, то загружем модальное окно с клиентом в ссылке
    editId = location.hash.split('#')[1];
    if (editId) {
        document.getElementById(editId).scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        modalOpen(modalEdit);
    }
    
    // Клонируем и открываем общее для всех модальное окно
    async function modalOpen(modalType) {
        // Задаем переменные
        const modal = document.createElement("div");
        const block = modalType.cloneNode(true);
        const cancel = block.querySelector('.cancel');
        const close = block.querySelector('.btn-close');
        let id = 0;

        // добавляем стили
        Object.assign(modal.style, {
          position: "fixed",
          left: "0px",
          top: "0px",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(51,51,51,.2)"
        });
      
        Object.assign(block.style, {
          display: "initial",
          opacity: 0,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% + 100px))",
          transition: ".6s opacity, .6s transform"
        });
        modal.append(block);
        document.body.append(modal);
        
        // задержка появления окна
        setTimeout(()=>Object.assign(block.style, {
          opacity: 1,
          transform: "translate(-50%,-50%)"
        }),15);

        // функция нажатия на "добавить КОНТАКТ" клиента (в окнах добавления и изменения)
        function addContactButton(contactFieldType = 'Телефон', contactFieldInput = '') {
            const clientList = block.querySelector('.add-contact-wrapper');
            if (screen.width >= 576) clientList.style.padding = "25px 30px 15px"; // отступы при экране больше 575px
            else clientList.style.padding = "25px 15px 15px";
            const clientBlock = document.createElement('div');
            clientBlock.classList.add('contact', 'flex');
            clientBlock.id = id;

            clientItemCheck = clientList.querySelectorAll('.contact')
            const addList = document.getElementById('addList');
            let prevId = clientItemCheck.length; // определяем предыдущий контакт
            
            // если поле контакта не заполнено
            if (clientItemCheck.length > 0 && clientItemCheck[prevId - 1].querySelector('.contact-input').value == '') {
                warning('Пожалуйста, заполните поле контакта');
                return;
            }
            id++;

            // ограничиваем количество контактов (убирается кнопка и появляется сообщение)
            if (clientList.childNodes.length > MAX_CONTACTS + 3) addClientWarning();
            addContact.before(clientBlock);

            const contactType = document.createElement('div');
            contactType.classList.add('contact-type', 'flex');
            contactType.id = 'addTel';
            contactType.textContent = contactFieldType;
            clientBlock.append(contactType);

            const contactInput = document.createElement('input');
            contactInput.classList.add('contact-input');
            contactInput.value = contactFieldInput;
            clientBlock.append(contactInput);

            const contactDelete = document.createElement('div');
            contactDelete.classList.add('contact-delete');
            clientBlock.append(contactDelete);

            // при нажатии на крестик удаляется строка контакта
            contactDelete.addEventListener("click", function(e) {
                clientBlock.remove();
                prevId--;
                if (clientList.childNodes.length < 6) clientList.style.padding = "0";
                const warningCheckMax = document.querySelector('.contact-warning-max');
                const warningCheck = document.querySelector('.contact-warning');

                // если контактов стало меньше максимума
                if (warningCheckMax) {
                    warningCheckMax.remove();
                    addContact.style.display = 'flex'; // возвращаем кнопку Добавить контакт
                }
                if (warningCheck) warningCheck.remove();
            });

            // Нажатие на кнопку выбора типа контакта
            let listCopy = addList.cloneNode(true);
            contactType.addEventListener("click", function(e) {
                modal.addEventListener("click", function(e) {
                    if (target.className !== "contact-type flex") {
                        listCopy.remove();
                        return;
                    }
                });
                if (clientBlock.querySelector('.contact-list')) {
                    listCopy.remove();
                    return;
                }
                clientBlock.append(listCopy);
                listCopy.style.display = "initial";
            });

            // Выбор в меню типа контакта (замена значений)
            listCopy.addEventListener("click", function(e) {
                targetId = e.target.id;
                targetText = target.textContent;
                let list = listCopy.querySelector(`#${targetId}`);

                tempId = contactType.id;
                tempText = contactType.textContent;

                contactType.id = list.id;
                contactType.textContent = list.textContent;

                list.id = tempId;
                list.textContent = tempText;

                listCopy.remove();                    
            });

            // убираем предупреждающую надпись, если что-то начинает вводиться в окне контакта
            contactInput.oninput = function(event) {
                const warningBlock = block.querySelector('.contact-warning');
                if (event.input !== '' && warningBlock) warningBlock.remove();
            }
        }

        // функция предупреждения о превышении максимума контактов
        function addClientWarning() {
            if (document.querySelector('.contact-warning-max')) return;
            const clientList = block.querySelector('.add-contact-wrapper');
            const clientWarning = document.createElement('p');
            clientWarning.classList.add('contact-warning-max');
            clientWarning.textContent = `Максимальное число контактов для клиента - ${MAX_CONTACTS}`;
            addContact.style.display = 'none'; // прячем кнопку Добавить контакт
            clientList.append(clientWarning);
            return;
        }

        // функция предупреждения о произвольных ошибках
        function warning(text) {
            if (document.querySelector('.contact-warning')) return;
            const clientList = block.querySelector('.add-contact-wrapper');
            const clientWarning = document.createElement('p');
            clientWarning.classList.add('contact-warning');
            clientWarning.textContent = text;
            clientList.append(clientWarning);
            return;
        }

        // если вызвано окно ИЗМЕНИТЬ клиента, то заполняем окно данными
        if (modalType == modalEdit) {
            // определяем поля для заполнения
            editIdText = block.querySelectorAll('.edit-id')[0];
            editSurnameField = block.querySelector('[name="surname"]');
            editNameField = block.querySelector('[name="name"]');
            editLastnameField = block.querySelector('[name="lastName"]');
            addContact = block.querySelector('.add-contact');

            // заполняем поля
            editIdText.textContent = `ID: ` + editId;
            editSurnameField.value = await dbGetElement(editId, 'surname');
            editNameField.value = await dbGetElement(editId, 'name');
            editLastnameField.value = await dbGetElement(editId, 'lastName');
            contacts = await dbGetElement(editId, 'contacts');

            // проверка на наличие контактов у клиента и заполнение
            if (contacts.length > 0) {
                for(let i = 0; i < contacts.length; i++) addContactButton(contacts[i].type, contacts[i].value);
            }
            if (contacts.length >= 10) addClientWarning(); // предупреждение, если уже есть 10 контактов
            addContact.onclick = function() { addContactButton(); } // добавляем контакт, если жмем на "Добавить контакт"
        }

        // если вызвано окно ДОБАВИТЬ клиента, то задаем ему настройки
        if (modalType == modalAdd) {
            // если жмем на текст перводим курсор на input
            placeholderSurname = block.querySelectorAll('.placeholder')[0];
            placeholderName = block.querySelectorAll('.placeholder')[1];
            placeholderSurname.onclick = function() { placeholderSurname.previousElementSibling.focus(); }
            placeholderName.onclick = function() { placeholderName.previousElementSibling.focus(); }

            addContact = block.querySelector('.add-contact');
            addContact.onclick = function() { addContactButton(); } // если жмем на "Добавить контакт"
        }

        // если куда-то тыкаем в модальном окне
        modal.addEventListener("click", function(e) {
            target = e.target;

            // если нажат крестик или cancel
            if (target.closest('.btn-close') == close || target == cancel) {
                document.body.removeChild(modal);
                return;
            }

            // если модальное окно УДАЛИТЬ клиента
            if (modalType == modalDelete) {
                okDelButton = block.querySelectorAll('.ok-btn')[0]; // определяем кнопки удаления

                // находим нажатую кнопку
                if (target == okDelButton) {
                    // функция удаления записи на сервере
                    async function clientItemDelete() {
                        await fetch(`http://localhost:3000/api/clients/${editId}`, {
                            method: 'DELETE'
                        });
                    }
                    // обновляем таблицу
                    async function clientListDeleteRefresh() {
                        await clientItemDelete(); // удаляем запись на сервере
                        await dbGetAllData(); // обновляем данные с сервера
                        document.body.removeChild(modal); // убираем модальное окно
                        let childId = document.body.lastChild.firstChild //определяем  id последнего окна
                        if (childId !== null && childId.id == 'modalEdit') document.body.lastChild.remove(); // если удаляем из окна редактирования, то закрываем окно
                        listRemove(); // очищаем таблицу
                        dbLoadClients(); // загружаем обновленные данные с сервера
                    }
                    clientListDeleteRefresh();
                    return;
                }
            }

            // Функция создания массива контактов для записи в базу данных
            function dbContactsMassive() {
                const level1 = block.getElementsByClassName('contact');
                    for (let i = 0; i < level1.length; i++) {
                        let level2 = level1[i];
                        let level3 = level2.getElementsByClassName('contact-input')[0];
                        if (level3.value == '') continue;
                        contactMass.push({ type: level2.textContent, value: level3.value })
                    }
                return(contactMass);
            }


            // ОБЩИЕ параметры у Добавить и Изменить клиента
            surName = block.querySelector('form').surname;
            firstName = block.querySelector('form').name;
            lastName = block.querySelector('form').lastName;
            okButton = block.querySelectorAll('.ok-btn')[0];
            contactMass = [];

            // функция записи в базу данных
            async function dbEditClient(type, editId) {
                try {
                    modal.prepend(SPIN);
                    SPIN.style.opacity = '1';
                    let response = await fetch(`http://localhost:3000/api/clients/${editId}`, {
                        method: type,
                        body: JSON.stringify({
                            surname: capitalizeFirstLetter(surName.value.trim()),
                            name: capitalizeFirstLetter(firstName.value.trim()),
                            lastName: capitalizeFirstLetter(lastName.value.trim()),
                            contacts: dbContactsMassive(),
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    SPIN.style.opacity = '0';
                    document.body.prepend(SPIN);
                    // обработка ошибок
                    if (response.status === 404 || response.status === 422) {
                        warning('Что-то пошло не так... Такого клиента не существует');
                        return false;
                    }
                    if (response.status === 500) {
                        warning('Странно, но сервер сломался :(<br>Обратитесь к разработчику, чтобы решить проблему');
                        return false;
                    }
                    contactMass.length = 0; // сбрасываем массив
                } catch(err) {
                    warning('Нет связи с сервером, обновите страницу позже или обратитесь к администратору.');
                    return false;
                }
            }

            // функция проверки заполнения полей
            function inputCheck() {

                // проверка имени и фамилии
                if (surName.value == '' || firstName.value == '') return false;

                // проверка поля контактов
                const clientList = block.querySelector('.add-contact-wrapper');
                clientItemCheck = clientList.querySelectorAll('.contact')
                let prevId = clientItemCheck.length;
                if (clientItemCheck.length > 0 && clientItemCheck[prevId - 1].querySelector('.contact-input').value == '') {
                    warning('Пожалуйста, заполните поле контакта');
                    event.preventDefault(); // предотвращаем перезагрузку страницы
                    return false;
                }
            }


            // модальное окно ДОБАВИТЬ клиента
            if (modalType == modalAdd) {

                // если нажимаем Сохранить клиента
                if (target == okButton) {
                    if (inputCheck() == false) return; // проверка на заполнение необходимых полей

                    // пишем в базу данных и обновляем таблицу
                    async function clientListAddRefresh() {
                        let response = await dbEditClient('POST', '');
                        if (response == false) return;
                        else response // изменяем запись на сервере
                        await dbGetAllData(); // обновляем данные с сервера
                        let addedId = data[data.length - 1].id; // определяем id нового клиента
                        document.body.removeChild(modal); // убираем модальное окно
                        listRemove(); // очищаем таблицу
                        dbLoadClients(); // загружаем обновленные данные в таблицу

                        let added = document.getElementById(addedId);
                        added.style.backgroundColor = 'var(--firm_background)'; // меняем фон подсветки нового клиента
                        setTimeout(() => added.style.backgroundColor = 'initial', 1000); // убираем подсветку
                        added.scrollIntoView({behavior: "smooth", block: "center", inline: "center"}); // скролл до клиента

                    }
                    clientListAddRefresh();
                }
            }

            // модальное окно ИЗМЕНИТЬ клиента
            if (modalType == modalEdit) {
                clientEditDelete = block.querySelector('.edit-delete');

                // если нажимаем Сохранить клиента
                if (target == okButton) {
                    if (inputCheck() == false) return; // проверка на заполнение необходимых полей
                    
                    // пишем в базу данных и обновляем таблицу
                    async function clientListEditRefresh() {
                        let response = await dbEditClient('PATCH', editId);
                        if (response == false) return;
                        else response // изменяем запись на сервере
                        await dbGetAllData(); // обновляем данные с сервера
                        document.body.removeChild(modal); // убираем модальное окно
                        listRemove(); // очищаем таблицу
                        dbLoadClients(); // загружаем обновленные данные в таблицу
                    }
                    clientListEditRefresh();
                }

                // если нажимаем на УДАЛЕНИЕ клиента
                if (target == clientEditDelete) {
                    modalOpen(modalDelete); // запускаем функцию открытия модального окна удаления клиента
                }
            }
           e.preventDefault(); // предотвращаем перезагрузку страницы
        });
    }
    addClientButton.addEventListener("click", ()=>modalOpen(modalAdd)); // запускаем функцию открытия модального окна добавления клиента
})();