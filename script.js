// ==UserScript==
// @name        DTF feeds v2.0
// @namespace   https://github.com/TentacleTenticals/DTF-feeds
// @match       https://dtf.ru/*
// @grant       none
// @version     1.0.1
// @author      Tentacle Tenticals
// @description Классы и функции
// @homepage    https://github.com/TentacleTenticals/DTF-feeds
// @updateURL   https://github.com/TentacleTenticals/DTF-feeds/raw/master/test.user.js
// @downloadURL https://github.com/TentacleTenticals/DTF-feeds/raw/master/test.user.js
// @license MIT
// ==/UserScript==
/* jshint esversion:8 */

(() => {
  let obs = {};
  function observer({target, mode, check, type, search, msg, func}){
    if(!target) return;
    let o;
    const callback = (mutationList, o) => {
      for(const mutation of mutationList){
        if(mutation.type === 'childList'){
          // console.log(mutation.target);
          if(check){
            if(!mutation.target.classList.length > 0) return;
            if(!mutation.target.classList.value.match(search)) return;
          }
          if(type){
            func(mutation.target);
          }else{
            for(let i = 0, arr = mutation.addedNodes; i < arr.length; i++){
              func(arr[i]);
            }
          }
        }
      }
    };
    o = new MutationObserver(callback);
    o.observe(target, mode ? mode : {attributes: false, childList: true, subtree: false, characterData: false});
    console.log(msg);
    return o;
  };
  function backupSettingsToFile(data, filename, type) {
    let file = new Blob([data], {type: type});
    if(window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(file, filename);
    else{
      var a = document.createElement("a"),
      url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
  function readSettingsBackup(submit, e){
    let fr = new FileReader();
    let path = e.target;
    fr.onloadend = (e) => {
      // console.log(JSON.parse(e.target.result));
      mainSettings = JSON.parse(e.target.result);
      console.log(`Настройки успешно восстановлены.`, mainSettings);
      new Alert({
        type: 'Settings import',
        text: 'Настройки успешно импортированы, но не сохранены. Переоткройте окно настроек и удостовертесь в том, что результат вас устраивает, после чего нажмите кнопку сохранения настроек.',
        timer: 10000
      })
      path.parentNode.children[1].textContent = 'Настройки успешно загружены.';
      submit.disabled = true;
    };
    fr.onerror = (e) => {
      console.log(e);
    };
    fr.readAsText(e.target.files[0]);
  }
  class Div{
    constructor({path, name, id, text, value, valueName, editable, style, onblur}){
      this.main=document.createElement('div');
      name ? this.main.className=name : '';
      id ? this.main.id=id : '';
      text ? this.main.textContent=text : '';
      editable ? this.main.setAttribute('contenteditable', true) : '';
      style ? this.main.style=style : '';
      onblur ? this.main.onblur=onblur : '';
      path.appendChild(this.main);

      return this.main;
    }
  };
  class Button{
    constructor({path, name, text, title, style, onclick}){
      this.button=document.createElement('button');
      name ? this.button.className=name : this.button.className='btn';
      this.button.textContent=text;
      title ? this.button.title=title : '';
      style ? this.button.style=style : '';
      onclick ? this.button.onclick=onclick : '';
      path.appendChild(this.button);
    }
  };
  class menuButton{
    constructor({path, text, title, buttons}){
      this.main=document.createElement('div');
      this.main.className='dtf-menuButton';
      this.main.textContent=text;
      title ? this.main.title=title : '';
      path.appendChild(this.main);

      this.list=document.createElement('div');
      this.list.className='menuList';
      this.main.appendChild(this.list);

      buttons(this.list);
    }
  };
  class Alert{
    constructor({text, type, alert, timer}){
      if(!document.getElementById('dtf-buttonsField')){
        new Div({
          path: document.body,
          name: 'dtf-buttonsField',
          id: 'dtf-buttonsField'
        })
      }
      this.main=document.createElement('div');
      this.main.className=alert ? 'dtf-alert err' : 'dtf-alert info';
      this.main.id='dtf-alert';
      document.getElementById('dtf-buttonsField').appendChild(this.main);

      new Div({
        path: this.main,
        name: 'type',
        text: type
      });
      new Div({
        path: this.main,
        name: 'text',
        text: text
      })

      if(timer){
        setTimeout(() => {
          this.main.classList.add('hide');
          setTimeout(() => {
            // this.main.parentNode.classList.add('hide');
            this.main.remove();
          }, 3000);
        }, timer+3000);
      }
    }
  };
  class Video{
  constructor({path, video}){
    this.main=document.createElement('div');
    this.main.className='DTF-video';
    path.replaceWith(this.main);

    this.video=document.createElement('video');
    this.video.src=video.getAttribute('data-video-mp4');
    // mainSettings['video settings'][`loop ${type}`] ? this.video.setAttribute(`loop ${type}`, '') : '';
    // mainSettings['video settings']['preview'] ? this.video.poster=video.getAttribute('data-video-thumbnail') : '';
    this.video.setAttribute('disablepictureinpicture', '');

    // this.video.controls=mainSettings['video settings']['controls'];
    this.video.playsInline=true;
    // this.video.muted=mainSettings['video settings']['mute off'];
    // this.video.volume=mainSettings['video settings']['volume level'];
    // mainSettings['video settings']['preload'] ? this.video.setAttribute('preload', mainSettings['video settings']['preload']) : '';
    this.video.onclick = (e) => {
      setTimeout(() => {
        console.log('Video is playing/paused');
        e.target.paused ? e.target.play() : e.target.pause();
      }, 100);
    }
    this.main.appendChild(this.video);
    // this.preview.style=`
    //   width: ${this.main.offsetWidth}px;
    //   height: ${this.main.offsetHeight}px`;
  }
};

class FeedGroups{
  constructor(){
    if(document.getElementById('dtf-feedGroups')) return;
    this.main=document.createElement('div');
    this.main.className='dtf-feedGroups';
    this.main.id='dtf-feedGroups';
    document.querySelector(`div[id=page_wrapper] div[class=feed] div[class=feed__container]`).insertBefore(this.main, document.querySelector(`div[id=page_wrapper] div[class=feed] div[class=feed__container]`).children[0]);

    // this.title=document.createElement('div');
    // this.title.textContent='Панель фидов';
    // this.title.style=`
    // padding: 5px;
    // margin-bottom: 3px;`
    // this.main.appendChild(this.title);

    this.groupEm=document.createElement('button');
    this.groupEm.className='groupBtn';
    this.groupEm.textContent='Группировать фиды';
    this.groupEm.style=`
    background-color: black;
    color: white;
    width: 100%;
    padding: 0px 0px 0px 25px;
    border-radius: 3px;
    cursor: pointer;`;
    this.groupEm.onclick=() => {
      feedsSearch();
    }
    this.main.appendChild(this.groupEm);

    new Group(this.main, 'subsite', 'В подсайтах');
    new Group(this.main, 'blogs', 'В блогах');
  }
}
  class TwinGroup{
    constructor(path){
      if(document.getElementById('dtf-feedGroups')) return;
      this.main=document.createElement('div');
      mainSettings['working mode']['type'].match(/obs$/) ? this.main.className='dtf-feedGroups obs' : this.main.className='dtf-feedGroups';
      this.main.id='dtf-feedGroups';
      document.querySelector(`div[id=page_wrapper] div[class=feed] div[class=feed__container]`).insertBefore(this.main, document.querySelector(`div[id=page_wrapper] div[class=feed] div[class=feed__container]`).children[0]);
    }
  }
  class Group{
    constructor(path, id, title){
      // if(document.getElementById(`dtf-fg-${id}`)) return;
      this.main=document.createElement('div');
      this.main.className='dtf-feed-group';
      this.main.id=`dtf-fg-${id}`;
      path.appendChild(this.main);

      this.panel=document.createElement('div');
      this.panel.className='groupHeader';
      this.panel.onclick=() => {
        if(this.panel.classList.value.match(/hidden/)){
          if(!this.new.classList.value.match(/off/)) this.new.classList.toggle('off');
        }
        this.groupList.classList.toggle('hidden');
      }
      this.main.appendChild(this.panel);

      this.title=document.createElement('div');
      this.title.className='title';
      this.title.textContent=title;
      this.panel.appendChild(this.title);

      this.num=document.createElement('div');
      this.num.className='num';
      this.num.textContent='0';
      this.panel.appendChild(this.num);

      this.new=document.createElement('div');
      this.new.className='newMark off';
      this.new.textContent='НОВОЕ';
      this.panel.appendChild(this.new);

      this.groupList=document.createElement('div');
      this.groupList.className='groupList hidden';
      this.main.appendChild(this.groupList);
    }
  }
  class SubGroup{
    constructor(path, icoSrc, title, target){
      if(!document.getElementById(`dtf-fg-sg-${title.trim()}`)){
        // console.log(target.querySelector(`.content-header-number`).textContent.trim())
        this.main=document.createElement('div');
        this.main.className='subGroup';
        this.main.id=`dtf-fg-sg-${title.trim()}`;
        path.appendChild(this.main);

        this.panel=document.createElement('div');
        this.panel.className='panel';
        this.panel.onclick=() => {
          if(this.subList.classList.value.match(/hidden/)){
            if(!this.new.classList.value.match(/off/)) this.new.classList.toggle('off');
          }
          this.subList.classList.toggle('hidden');
        }
        this.main.appendChild(this.panel);

        this.mask=document.createElement('div');
        this.mask.className='mask';
        this.panel.appendChild(this.mask);

        this.ico=document.createElement('img');
        this.ico.className='ico';
        this.ico.src=icoSrc;
        this.mask.appendChild(this.ico);

        this.title=document.createElement('div');
        this.title.className='title';
        this.title.textContent=title.trim();
        this.panel.appendChild(this.title);

        this.num=document.createElement('div');
        this.num.className='num';
        this.num.textContent=0;
        this.panel.appendChild(this.num);

        this.new=document.createElement('div');
        this.new.className='newMark';
        this.new.textContent=`📰 (${target.querySelector(`.content-header-number`).textContent.trim()})`;
        this.panel.appendChild(this.new);

        this.sgActions=document.createElement('div');
        this.sgActions.className='sgActions';
        this.panel.appendChild(this.sgActions);

        new Button({
          path: this.sgActions,
          text: 'Удалить подгруппу',
          title: 'Внимание! Это удалит все фиды внутри группы!',
          onclick: () => {
            this.main.remove();
          }
        })

        this.subList=document.createElement('div');
        this.subList.className='subList hidden';
        this.main.appendChild(this.subList);

        this.subList.appendChild(target);
        this.num.textContent=(this.subList.children.length);

        // this.main.parentNode.children[0].children[2].classList.toggle('off');
      }else{
        this.main=document.getElementById(`dtf-fg-sg-${title.trim()}`);
        this.subList=this.main.children[1];
        this.subList.appendChild(target);
        this.num=this.main.children[0].children[2];
        this.num.textContent=(this.subList.children.length);
      }
    }
  }

  class FeedActions{
    constructor(path, main){
      if(main.querySelector(`div[class=feed-actions]`)) return;
      this.main=document.createElement('div');
      this.main.className='feed-actions';
      // path.appendChild(this.main);
      path.parentNode.insertBefore(this.main, path.parentNode.children[2]);

      new Button({
        path: this.main,
        text: '🗜️',
        title: 'Свернуть фид',
        name: 'collapseFeed btn',
        onclick: (e) => {
          // if(e.target.parentNode.parentNode.parentNode.parentNode.classList.value.match(/watched|ignored/)) return;
          e.target.parentNode.parentNode.parentNode.parentNode.classList.toggle('collapsed');
        }
      })

      new Button({
        path: this.main,
        text: '✔️',
        title: 'Пометить как просмотрено. Фид будет свёрнут всегда',
        name: 'watchFeed btn',
        onclick: (e) => {
          let feedID = e.target.parentNode.parentNode.parentNode.getAttribute('data-content-id').toString();
          let info = e.target.parentNode.parentNode.children[0];
          let userIDFilter = /https:\/\/dtf\.ru\/(u|s)\/(\d+)-[^]+/;
          let textFixer = /( {2,}|\n{2,})/gm;
          function getInfo(target){
            let filter = /https:\/\/dtf\.ru\/(u\/|s\/|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
            let o;
            target.replace(filter, (d, type, id, username) => {
              if(type.match(/u\//) && id && username){
                console.log('User');
                o = {author:username, authorType:'User', authorID:id};
              }else
              if(type.match(/s\//) && !id && username){
                console.log('Official subsite');
                o = {author:username, authorType:'Official subsite', authorID:username};
              }
              if(type.match(/s\//) && id && username){
                console.log('User subsite');
                o = {author:username, authorType:'User subsite', authorID:id};
              }else
              if(!type.match(/u\/|s\//) && !id && !username){
                console.log('DTF subsite');
                o = {author:type, authorType:'DTF subsite', authorID:type};
              }
            })
            return o;
          }
          function getTime(){
            let t = new Date();

            return `${t.getFullYear()}/${t.getMonth()+1 < 10 ? `0${t.getMonth()+1}` : t.getMonth()+1}/${t.getDate() < 10 ? `0${t.getDate()}` : t.getDate()} ${t.getHours() < 10 ? `0${t.getHours()}` : t.getHours()}:${t.getMinutes() < 10 ? `0${t.getMinutes()}` : t.getMinutes()}:${t.getSeconds() < 10 ? `0${t.getSeconds()}` : t.getSeconds()}`
          }
          // if(e.target.parentNode.parentNode.parentNode.parentNode.classList.value.match(/collapsed/)) e.target.parentNode.parentNode.parentNode.parentNode.classList.remove('collapsed');
          mainSettings.data['watched feeds'].find(i => i.feedID === feedID) ? (mainSettings.data['watched feeds'] = mainSettings.data['watched feeds'].filter(i => i.feedID !== feedID)) : mainSettings.data['watched feeds'].push({
            feedID:feedID,
            feedTitle:((e.target.parentNode.parentNode.parentNode.querySelector(`.content-title`)||{}).textContent||'').trim().replace(textFixer, ''),
              ...info.children.length <= 2 ? {
                author:info.children[0].children[0].children[1].textContent.trim(),
                authorID:getInfo(info.children[0].children[0].href).authorID,
                authorType:getInfo(info.children[0].children[0].href).authorType,
                date:getTime()
              } : {
                subsite:info.children[0].children[0].children[1].textContent.trim(),
                subsiteID:getInfo(info.children[0].children[0].href).authorID,
                author:info.children[1].children[0].textContent.trim(),
                authorID:getInfo(info.children[1].children[0].href).authorID,
                authorType:getInfo(info.children[1].children[0].href).authorType,
                date:getTime()
              }
          });
          e.target.parentNode.parentNode.parentNode.parentNode.classList.toggle('watchedFeed');
          e.target.parentNode.parentNode.parentNode.parentNode.classList.toggle('collapsed');
          // e.target.parentNode.parentNode.parentNode.parentNode.classList.toggle('collapsed');
          console.log(mainSettings.data['watched feeds']);
          settingsUpdater(db, mainSettings, {firstRun: false});
        }
      })

      new Button({
        path: this.main,
        text: '🚫',
        title: 'Пометить как игнорировано. Фид будет свёрнут всегда',
        name: 'ignoreFeed btn',
        onclick: (e) => {
          let feedID = e.target.parentNode.parentNode.parentNode.getAttribute('data-content-id').toString();
          let info = e.target.parentNode.parentNode.children[0];
          let userIDFilter = /https:\/\/dtf\.ru\/(u|s)\/(\d+)-[^]+/;
          let textFixer = /( {2,}|\n{2,})/gm;
          function getInfo(target){
            let filter = /https:\/\/dtf\.ru\/(u\/|s\/|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
            let o;
            target.replace(filter, (d, type, id, username) => {
              if(type.match(/u\//) && id && username){
                console.log('User');
                o = {author:username, authorType:'User', authorID:id};
              }else
              if(type.match(/s\//) && !id && username){
                console.log('Official subsite');
                o = {author:username, authorType:'Official subsite', authorID:username};
              }
              if(type.match(/s\//) && id && username){
                console.log('User subsite');
                o = {author:username, authorType:'User subsite', authorID:id};
              }else
              if(!type.match(/u\/|s\//) && !id && !username){
                console.log('DTF subsite');
                o = {author:type, authorType:'DTF subsite', authorID:type};
              }
            })
            return o;
          }
          function getTime(){
            let t = new Date();

            return `${t.getFullYear()}/${t.getMonth()+1 < 10 ? `0${t.getMonth()+1}` : t.getMonth()+1}/${t.getDate() < 10 ? `0${t.getDate()}` : t.getDate()} ${t.getHours() < 10 ? `0${t.getHours()}` : t.getHours()}:${t.getMinutes() < 10 ? `0${t.getMinutes()}` : t.getMinutes()}:${t.getSeconds() < 10 ? `0${t.getSeconds()}` : t.getSeconds()}`
          }
          // if(e.target.parentNode.parentNode.parentNode.parentNode.classList.value.match(/collapsed/)) e.target.parentNode.parentNode.parentNode.parentNode.classList.remove('collapsed');
          mainSettings.data['ignored feeds'].find(i => i.feedID === feedID) ? (mainSettings.data['ignored feeds'] = mainSettings.data['ignored feeds'].filter(i => i.feedID !== feedID)) : mainSettings.data['ignored feeds'].push({
            feedID:feedID,
            feedTitle:((e.target.parentNode.parentNode.parentNode.querySelector(`.content-title`)||{}).textContent||'').trim().replace(textFixer, ''),
              ...info.children.length <= 2 ? {
                author:info.children[0].children[0].children[1].textContent.trim(),
                authorID:getInfo(info.children[0].children[0].href).authorID,
                authorType:getInfo(info.children[0].children[0].href).authorType,
                date:getTime()
              } : {
                subsite:info.children[0].children[0].children[1].textContent.trim(),
                subsiteID:getInfo(info.children[0].children[0].href).authorID,
                author:info.children[1].children[0].textContent.trim(),
                authorID:getInfo(info.children[1].children[0].href).authorID,
                authorType:getInfo(info.children[1].children[0].href).authorType,
                date:getTime()
              }
          });
          e.target.parentNode.parentNode.parentNode.parentNode.classList.toggle('ignoredFeed');
          e.target.parentNode.parentNode.parentNode.parentNode.classList.toggle('collapsed');
          // console.log(mainSettings.data['ignored feeds']);
          settingsUpdater(db, mainSettings, {firstRun: false});
        }
      })

      new menuButton({
        path: this.main,
        text: '📓',
        title: 'Действия с авторами',
        buttons: (path) => {
          new Button({
            path: path,
            text: '💘',
            title: 'Добавить автора в избранное',
            name: 'favoriteAuthor btn',
            onclick: (e) => {
              let info = e.target.parentNode.parentNode.parentNode.parentNode.children[0];
              let userIDFilter = /https:\/\/dtf\.ru\/(u|s)\/(\d+)-[^]+/;
              function getInfo(target){
                let filter = /https:\/\/dtf\.ru\/(u\/|s\/|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
                let o;
                target.replace(filter, (d, type, id, username) => {
                  if(type.match(/u\//) && id && username){
                    console.log('User');
                    o = {author:username, authorType:'User', authorID:id};
                  }else
                  if(type.match(/s\//) && !id && username){
                    console.log('Official subsite');
                    o = {author:username, authorType:'Official subsite', authorID:username};
                  }
                  if(type.match(/s\//) && id && username){
                    console.log('User subsite');
                    o = {author:username, authorType:'User subsite', authorID:id};
                  }else
                  if(!type.match(/u\/|s\//) && !id && !username){
                    console.log('DTF subsite');
                    o = {author:type, authorType:'DTF subsite', authorID:type};
                  }
                })
                return o;
              }
              // if(e.target.parentNode.parentNode.parentNode.parentNode.classList.value.match(/favorite/)) return;
              info.parentNode.parentNode.parentNode.classList.toggle('favoriteAuthor');
              let authorID = info.children.length <= 2 ? info.children[0].children[0].href.replace(userIDFilter, '$1') : info.children[1].children[0].href.replace(userIDFilter, '$1');
              // console.log(userID);
              mainSettings.data['favorite authors'].find(i => i.authorID === authorID) ? (mainSettings.data['favorite authors'] = mainSettings.data['favorite authors'].filter(i => i.authorID !== authorID)) : mainSettings.data['favorite authors'].push(
                info.children.length <= 2 ? {
                  author:info.children[0].children[0].children[1].textContent.trim(),
                  authorID:getInfo(info.children[0].children[0].href).authorID,
                  authorType:getInfo(info.children[0].children[0].href).authorType
                } : {
                  author:info.children[1].children[0].textContent.trim(),
                  authorID:getInfo(info.children[1].children[0].href).authorID,
                  authorType:getInfo(info.children[1].children[0].href).authorType
                }
              );
              settingsUpdater(db, mainSettings, {firstRun: false});
              // if(mainSettings['working mode']['type'].match(/panel$/) && mainSettings['what to group']['blogs'] && info.children.length <= 2) info.parentNode.parentNode.parentNode.parentNode.parentNode.classList.add('favoriteAuthor');
            }
          })

          new Button({
            path: path,
            text: '💢',
            title: 'Добавить автора в игнорируемые',
            name: 'ignoreAuthor btn',
            onclick: (e) => {
              let info = e.target.parentNode.parentNode.parentNode.parentNode.children[0];
              let userIDFilter = /https:\/\/dtf\.ru\/(u|s)\/(\d+)-[^]+/;
              function getInfo(target){
                let filter = /https:\/\/dtf\.ru\/(u\/|s\/|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
                let o;
                target.replace(filter, (d, type, id, username) => {
                  if(type.match(/u\//) && id && username){
                    console.log('User');
                    o = {author:username, authorType:'User', authorID:id};
                  }else
                  if(type.match(/s\//) && !id && username){
                    console.log('Official subsite');
                    o = {author:username, authorType:'Official subsite', authorID:username};
                  }
                  if(type.match(/s\//) && id && username){
                    console.log('User subsite');
                    o = {author:username, authorType:'User subsite', authorID:id};
                  }else
                  if(!type.match(/u\/|s\//) && !id && !username){
                    console.log('DTF subsite');
                    o = {author:type, authorType:'DTF subsite', authorID:type};
                  }
                })
                return o;
              }
              // if(e.target.parentNode.parentNode.parentNode.parentNode.classList.value.match(/favorite/)) return;
              info.parentNode.parentNode.parentNode.classList.toggle('ignoredAuthor');
              info.parentNode.parentNode.parentNode.classList.toggle('collapsed');
              let authorID = info.children.length <= 2 ? info.children[0].children[0].href.replace(userIDFilter, '$1') : info.children[1].children[0].href.replace(userIDFilter, '$1');
              // console.log(userID);
              mainSettings.data['ignored authors'].find(i => i.authorID === authorID) ? (mainSettings.data['ignored authors'] = mainSettings.data['ignored authors'].filter(i => i.authorID !== authorID)) : mainSettings.data['ignored authors'].push(
                info.children.length <= 2 ? {
                  author:info.children[0].children[0].children[1].textContent.trim(),
                  authorID:getInfo(info.children[0].children[0].href).authorID,
                  authorType:getInfo(info.children[0].children[0].href).authorType
                } : {
                  author:info.children[1].children[0].textContent.trim(),
                  authorID:getInfo(info.children[1].children[0].href).authorID,
                  authorType:getInfo(info.children[1].children[0].href).authorType
                }
              );
              settingsUpdater(db, mainSettings, {firstRun: false});
              // if(mainSettings['working mode']['type'].match(/panel$/) && mainSettings['what to group']['blogs']) info.parentNode.parentNode.parentNode.parentNode.parentNode.classList.add('ignoredAuthor');
            }
          })
        }
      })


      new menuButton({
        path: this.main,
        text: '📚',
        title: 'Действия с подсайтами',
        buttons: (path) => {
          new Button({
            path: path,
            text: '💘',
            title: 'Добавить подсайт в избранные',
            name: 'favoriteSubsite btn',
            onclick: (e) => {
              let info = e.target.parentNode.parentNode.parentNode.parentNode.children[0];
              if(info.children.length <= 2) return;
              let userIDFilter = /https:\/\/dtf\.ru\/(u|s)\/(\d+)-[^]+/;
              function getInfo(target){
                let filter = /https:\/\/dtf\.ru\/(u\/|s\/|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
                let o;
                target.replace(filter, (d, type, id, username) => {
                  if(type.match(/u\//) && id && username){
                    console.log('User');
                    o = {author:username, authorType:'User', authorID:id};
                  }else
                  if(type.match(/s\//) && !id && username){
                    console.log('Official subsite');
                    o = {author:username, authorType:'Official subsite', authorID:username};
                  }
                  if(type.match(/s\//) && id && username){
                    console.log('User subsite');
                    o = {author:username, authorType:'User subsite', authorID:id};
                  }else
                  if(!type.match(/u\/|s\//) && !id && !username){
                    console.log('DTF subsite');
                    o = {author:type, authorType:'DTF subsite', authorID:type};
                  }
                })
                return o;
              }
              // if(e.target.parentNode.parentNode.parentNode.parentNode.classList.value.match(/favorite/)) return;
              info.parentNode.parentNode.parentNode.classList.toggle('favoriteSubsite');
              let authorID = info.children.length <= 2 ? info.children[0].children[0].href.replace(userIDFilter, '$1') : info.children[1].children[0].href.replace(userIDFilter, '$1');
              // console.log(userID);
              mainSettings.data['favorite subsites'].find(i => i.authorID === authorID) ? (mainSettings.data['favorite subsites'] = mainSettings.data['favorite subsites'].filter(i => i.authorID !== authorID)) : mainSettings.data['favorite subsites'].push(
                {
                  author:info.children[0].children[0].textContent.trim(),
                  authorID:getInfo(info.children[0].children[0].href).authorID,
                  authorType:getInfo(info.children[0].children[0].href).authorType
                }
              );
              settingsUpdater(db, mainSettings, {firstRun: false});
              // if(mainSettings['working mode']['type'].match(/panel$/) && mainSettings['what to group']['subsites'] && info.children.length <= 2) info.parentNode.parentNode.parentNode.parentNode.parentNode.classList.add('favoriteSubsite');
            }
          })

          new Button({
            path: path,
            text: '💢',
            title: 'Добавить подсайт в игнорируемые',
            name: 'ignoreSubsite btn',
            onclick: (e) => {
              let info = e.target.parentNode.parentNode.parentNode.parentNode.children[0];
              if(info.children.length <= 2) return;
              let userIDFilter = /https:\/\/dtf\.ru\/(u|s)\/(\d+)-[^]+/;
              function getInfo(target){
                let filter = /https:\/\/dtf\.ru\/(u\/|s\/|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
                let o;
                target.replace(filter, (d, type, id, username) => {
                  if(type.match(/u\//) && id && username){
                    console.log('User');
                    o = {author:username, authorType:'User', authorID:id};
                  }else
                  if(type.match(/s\//) && !id && username){
                    console.log('Official subsite');
                    o = {author:username, authorType:'Official subsite', authorID:username};
                  }
                  if(type.match(/s\//) && id && username){
                    console.log('User subsite');
                    o = {author:username, authorType:'User subsite', authorID:id};
                  }else
                  if(!type.match(/u\/|s\//) && !id && !username){
                    console.log('DTF subsite');
                    o = {author:type, authorType:'DTF subsite', authorID:type};
                  }
                })
                return o;
              }
              // if(e.target.parentNode.parentNode.parentNode.parentNode.classList.value.match(/favorite/)) return;
              info.parentNode.parentNode.parentNode.classList.toggle('ignoredSubsite');
              info.parentNode.parentNode.parentNode.classList.toggle('collapsed');
              let authorID = info.children.length <= 2 ? info.children[0].children[0].href.replace(userIDFilter, '$1') : info.children[1].children[0].href.replace(userIDFilter, '$1');
              // console.log(userID);
              mainSettings.data['ignored subsites'].find(i => i.authorID === authorID) ? (mainSettings.data['ignored subsites'] = mainSettings.data['ignored subsites'].filter(i => i.authorID !== authorID)) : mainSettings.data['ignored subsites'].push(
                {
                  author:info.children[0].children[0].textContent.trim(),
                  authorID:getInfo(info.children[0].children[0].href).authorID,
                  authorType:getInfo(info.children[0].children[0].href).authorType
                }
              );
              settingsUpdater(db, mainSettings, {firstRun: false});
              // if(mainSettings['working mode']['type'].match(/panel$/) && mainSettings['what to group']['subsites']) info.parentNode.parentNode.parentNode.parentNode.parentNode.classList.add('ignoredSubsite');
            }
          })
        }
      })



      new Button({
        path: this.main,
        text: '✖️',
        name: 'deleteFeed btn',
        title: 'Удалить фид. Это удалит лишь сам элемент фида',
        onclick: (e) => {
          if(mainSettings['what to group']['blogs']||mainSettings['what to group']['subsites']){
            if(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.classList.value.match(/subList/)){
              e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.children[0].children[2].textContent = +e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.children[1].children.length - 1;
            }
          }
          // e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.children[0].children[1].textContent = +e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.children[1].children.length - 1;
          e.target.parentNode.parentNode.parentNode.parentNode.remove();
        }
      })

    }
  }

  function feedsSearch(){
    function getPageType(url){
      let filter = /https:\/\/dtf\.ru\/(u\/|s\/|new$|popular$|my\/new$|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
      let o;
      url.replace(filter, (d, type, id, username) => {
        if(type.match(/u\//) && id && username){
          // console.log('User page');
          o = 'user pages';
        }else
        if(type.match(/s\//) && !id && username){
          // console.log('Official subsite');
          o = 'subsites';
        }
        if(type.match(/s\//) && id && username){
          // console.log('User subsite');
          o = 'subsites';
        }else
        if(type.match(/^new$/)){
          // console.log('New');
          o = 'new';
        }else
        if(type.match(/^popular$/)){
          // console.log('Popular');
          o = 'popular';
        }else
        if(type.match(/^my\/new$/)){
          // console.log('My feed');
          o = 'my new';
        }else
        if(!type.match(/u\/|s\//) && !id && !username){
          // console.log('DTF subsite');
          o = 'subsites';
        }
      })
      return o;
    }
    function getInfo(target){
      let filter = /https:\/\/dtf\.ru\/(u\/|s\/|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
      let o;
      target.replace(filter, (d, type, id, username) => {
        if(type.match(/u\//) && id && username){
          console.log('User');
          o = {author:username, authorType:'User', authorID:id};
        }else
        if(type.match(/s\//) && !id && username){
          console.log('Official subsite');
          o = {author:username, authorType:'Official subsite', authorID:username};
        }
        if(type.match(/s\//) && id && username){
          console.log('User subsite');
          o = {author:username, authorType:'User subsite', authorID:id};
        }else
        if(!type.match(/u\/|s\//) && !id && !username){
          console.log('DTF subsite');
          o = {author:type, authorType:'DTF subsite', authorID:type};
        }
      })
      return o;
    }
    let num = 0;
    let blogsTitleFilter;
    let blogsTextFilter;
    let subsitesTitleFilter;
    let subsitesTextFilter;
    let location = getPageType(document.location.href);
    if(mainSettings['feeds blogs title filter']['words'].length > 0){
      try {
        blogsTitleFilter = new RegExp(mainSettings['feeds blogs title filter']['words'].join('|'), 'mi');
      } catch (err) {
        new Alert({
          alert: true,
          type: 'RegExp',
          text: 'Ошибка создания blogs title RegExp фильтра. Вы выбрали неверные слова/фразы.',
          timer: 10000
        })
      }
      console.log('BlogsTitleFilter ', blogsTitleFilter);
    }
    if(mainSettings['feeds blogs text filter']['words'].length > 0){
      try {
        blogsTextFilter = new RegExp(mainSettings['feeds blogs text filter']['words'].join('|'), 'mi');
      } catch (err) {
        new Alert({
          alert: true,
          type: 'RegExp',
          text: 'Ошибка создания blogs text RegExp фильтра. Вы выбрали неверные слова/фразы.',
          timer: 10000
        })
      }
      console.log('BlogsTextFilter ', blogsTextFilter);
    }
    if(mainSettings['feeds subsites title filter']['words'].length > 0){
      try {
        subsitesTitleFilter = new RegExp(mainSettings['feeds subsites title filter']['words'].join('|'), 'mi');
      } catch (err) {
        new Alert({
          alert: true,
          type: 'RegExp',
          text: 'Ошибка создания subsites title RegExp фильтра. Вы выбрали неверные слова/фразы.',
          timer: 10000
        })
      }
      console.log('subsitesTitleFilter ', subsitesTitleFilter);
    }
    if(mainSettings['feeds subsites text filter']['words'].length > 0){
      try {
        subsitesTextFilter = new RegExp(mainSettings['feeds subsites text filter']['words'].join('|'), 'mi');
      } catch (err) {
        new Alert({
          alert: true,
          type: 'RegExp',
          text: 'Ошибка создания subsites text RegExp фильтра. Вы выбрали неверные слова/фразы.',
          timer: 10000
        })
      }
      console.log('subsitesTextFilter ', subsitesTextFilter);
    }
    for(let i = 0, arr = document.querySelectorAll(`div[id=page_wrapper] div[class=feed] :not(div[class=DTF-feed-group]) div[class^=feed__item][class*=l-island-round]`); i < arr.length; i++){
      if(arr[i].querySelector(`div[class=content-header__info]`).children.length <= 2){
        if(mainSettings['where to react'][location] && !mainSettings['where to react'][`${location} types`].match(/blogs$|blogs and subsites/)){
          arr[i].remove();
          console.log('Блог удалён, низя здесь!');
          continue;
        }
        // if(arr[i].querySelector(`.andropov_video`)){
        //   let v = arr[i].querySelector(`.andropov_video`);
        //   if(v.getAttribute('data-video-mp4') && v.getAttribute('data-video-service') === 'default'){
        //     console.log(`[Init video] Видео найдено, создаю новые элементы для него.`);
        //     new Video({
        //       path: v.parentNode.parentNode.parentNode,
        //       video: v
        //     });
        //   }
        // }
        if(mainSettings.data['watched feeds'].find(w => w.feedID === arr[i].children[0].getAttribute('data-content-id').toString())){
          console.log('Blog watched!');
          if(mainSettings['watched feeds']['what to do with watched feeds'] === 'collapse'){
            arr[i].classList.add('watchedFeed', 'collapsed');
          }else{
            arr[i].remove();
            console.log('Watched feed is removed');
            continue;
          }
        }
        if(mainSettings.data['ignored feeds'].find(w => w.feedID === arr[i].children[0].getAttribute('data-content-id').toString())){
          console.log('Blog blocked!');
          if(mainSettings['ignored feeds']['what to do with ignored feeds'] === 'collapse'){
            arr[i].classList.add('ignoredFeed', 'collapsed');
          }else{
            arr[i].remove();
            console.log('Ignored feed is removed');
            continue;
          }
        }
        // Фильтр блогов по заголовкам
        if(arr[i].querySelector(`div[class=content-container]`)){
        if(mainSettings['feeds blogs title filter']['filter enabled']){
          if(mainSettings['feeds blogs title filter']['block without title']){
            if(!arr[i].querySelector(`div[class=content-container]`).children[0].classList.value.match(/content-title/)){
              console.log('BLOG NO TITLE!', arr[i]);
              if(mainSettings['feeds blogs title filter']['how to block blogs title'] === 'collapse'){
                arr[i].classList.add('blogBlockedByNoTitle', 'collapsed');
              }else{
                arr[i].remove();
                console.log('Blog feed removed1', arr[i]);
                continue;
              }
            }
          }
          if(mainSettings['feeds blogs title filter']['block with text in title'] && blogsTitleFilter){
            // let blogsTitleFilter = new RegExp(mainSettings['feeds blogs title filter']['words'].join('|'), 'mi');
            if(arr[i].querySelector(`div[class=content-container]`).children[0].classList.value.match(/content-title/)){
              console.log('Title: ', arr[i].querySelector(`div[class=content-container]`).children[0].textContent.trim());
              if(arr[i].querySelector(`div[class=content-container]`).children[0].textContent.trim().match(blogsTitleFilter)){
                console.log('Blogs title filter found item!', arr[i].querySelector(`div[class=content-container]`).children[0].textContent.trim());
                if(mainSettings['feeds blogs title filter']['how to block blogs title'] === 'collapse'){
                  arr[i].classList.add('blogBlockedByTitle', 'collapsed');
                }else{
                  arr[i].remove();
                  console.log('Blog feed removed2', arr[i]);
                  continue;
                }
              }
            }
          }
        }
        // Фильтр блогов по тексту
        if(mainSettings['feeds blogs text filter']['filter enabled']){
          if(mainSettings['feeds blogs text filter']['block without text']){
            if(!arr[i].querySelector(`div[class=content-container] p`)){
              console.log('BLOG NO TEXT!', arr[i]);
              if(mainSettings['feeds blogs text filter']['how to block blogs text'] === 'collapse'){
                arr[i].classList.add('blogBlockedByNoText', 'collapsed');
              }else{
                arr[i].remove();
                console.log('Blog feed removed1', arr[i]);
                continue;
              }
            }
          }
          if(mainSettings['feeds blogs text filter']['block with some text'] && blogsTextFilter){
            // let blogsTitleFilter = new RegExp(mainSettings['feeds blogs title filter']['words'].join('|'), 'mi');
            if(arr[i].querySelector(`div[class=content-container] p`)){
              console.log('Text: ', arr[i].querySelector(`div[class=content-container] p`).textContent.trim());
              if(arr[i].querySelector(`div[class=content-container]`).textContent.trim().match(blogsTextFilter)){
                console.log('Blogs text filter found item!');
                if(mainSettings['feeds blogs text filter']['how to block blogs text'] === 'collapse'){
                  arr[i].classList.add('blogBlockedByText', 'collapsed');
                }else{
                  arr[i].remove();
                  console.log('Blog feed removed1', arr[i]);
                  continue;
                }
              }
            }
          }
        }
        // console.log(arr[i].querySelector(`div[class=content-container]`).children[0].textContent)
        // if(arr[i].querySelector(`div[class=content-container]`).children[0].textContent.match(/[^]+/)){
          // arr[i].classList.toggle('ignoredFeed');
        // }
      }
        new FeedActions(arr[i].querySelector(`div[class=content-header__info]`), arr[i]);
        // document.getElementById('dtf-feedGroups').children[2].children[1].appendChild(arr[i]);
        if(mainSettings['working mode']['type'].match(/panel$/)){
          if(mainSettings['what to group']['blogs']){
            new SubGroup(
              document.getElementById('dtf-feedGroups').children[2].children[1],
              arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[0].children[0].getAttribute('data-image-src'),
              arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[1].textContent, arr[i]
            );
            if(mainSettings.data['favorite authors'].find(a => a.authorID === arr[i].querySelector(`div[class*=content-header-author--subsite]`).children[0].href.replace(/[^\d]+(\d+)[^]+/, '$1'))){
              console.log('I see favorite!');
              arr[i].classList.add('favoriteAuthor');
              arr[i].parentNode.parentNode.classList.add('favoriteAuthor');
            }
            if(mainSettings.data['ignored authors'].find(a => a.authorID === arr[i].querySelector(`div[class*=content-header-author--subsite]`).children[0].href.replace(/[^\d]+(\d+)[^]+/, '$1'))){
              console.log('I see blocked!');
              if(mainSettings['ignored authors']['what to do with ignored authors'] === 'collapse'){
                arr[i].classList.add('ignoredAuthor', 'collapsed');
                arr[i].parentNode.parentNode.classList.add('ignoredAuthor');
              }else{
                arr[i].remove();
                console.log('Ignored author is removed');
                continue;
              }
            }
          }else{
            document.getElementById('dtf-feedGroups').children[2].children[1].appendChild(arr[i]);
          }
        }else
        if(mainSettings['working mode']['type'].match(/obs$/)){
          document.getElementById('dtf-feedGroups').appendChild(arr[i]);
          if(mainSettings.data['favorite authors'].find(a => a.authorID === arr[i].querySelector(`div[class*=content-header-author--subsite]`).children[0].href.replace(/[^\d]+(\d+)[^]+/, '$1'))){
            console.log('I see favorite!');
            arr[i].classList.add('favoriteAuthor');
          }
          if(mainSettings.data['ignored authors'].find(a => a.authorID === arr[i].querySelector(`div[class*=content-header-author--subsite]`).children[0].href.replace(/[^\d]+(\d+)[^]+/, '$1'))){
            console.log('I see blocked!');
            if(mainSettings['ignored authors']['what to do with ignored authors'] === 'collapse'){
              arr[i].classList.add('ignoredAuthor', 'collapsed');
            }else{
              arr[i].remove();
              console.log('Ignored author is removed');
              continue;
            }
          }
        }
        // if(co[d].classList.value.match(/content-header-author/)) console.log(co[d])
      }else
      if(arr[i].querySelector(`div[class=content-header__info]`).children.length > 2){
        if(mainSettings['where to react'][location] && !mainSettings['where to react'][`${location} types`].match(/subsites$|blogs and subsites/)){
          arr[i].remove();
          console.log('Подсайт удалён, низя здесь!');
          continue;
        }
        // if(arr[i].querySelector(`.andropov_video`)){
        //   let v = arr[i].querySelector(`.andropov_video`);
        //   if(v.getAttribute('data-video-mp4') && v.getAttribute('data-video-service') === 'default'){
        //     console.log(`[Init video] Видео найдено, создаю новые элементы для него.`);
        //     new Video({
        //       path: v.parentNode.parentNode.parentNode,
        //       video: v
        //     });
        //   }
        // }
        if(arr[i].querySelector(`div[class=content-header__info]`).children[1].classList.value.match(/content-header-author/)){
          // console.log('ID: ', arr[i].children[0].getAttribute('data-content-id').toString());
          if(mainSettings.data['watched feeds'].find(w => w.feedID === arr[i].children[0].getAttribute('data-content-id').toString())){
            console.log('Watched!');
            if(mainSettings['watched feeds']['what to do with watched feeds'] === 'collapse'){
              arr[i].classList.add('watchedFeed', 'collapsed');
            }else{
              arr[i].remove();
              console.log('Watched feed is removed');
              continue;
            }
          }
          if(mainSettings.data['ignored feeds'].find(w => w.feedID === arr[i].children[0].getAttribute('data-content-id').toString())){
            console.log('Blocked!');
            if(mainSettings['ignored feeds']['what to do with ignored feeds'] === 'collapse'){
              arr[i].classList.add('ignoredFeed', 'collapsed');
            }else{
              arr[i].remove();
              console.log('Ignored feed is removed');
              continue;
            }
          }
          if(mainSettings.data['favorite authors'].find(a => a.authorID === arr[i].querySelector(`.content-header-author--user`).children[0].href.replace(/[^\d]+(\d+)[^]+/, '$1'))){
            console.log('I see favorite!');
            arr[i].classList.add('favoriteAuthor');
          }
          if(mainSettings.data['ignored authors'].find(a => a.authorID === arr[i].querySelector(`.content-header-author--user`).children[0].href.replace(/[^\d]+(\d+)[^]+/, '$1'))){
            console.log('I see blocked!');
            if(mainSettings['ignored authors']['what to do with ignored authors'] === 'collapse'){
              arr[i].classList.add('ignoredAuthor', 'collapsed');
            }else{
              arr[i].remove();
              console.log('Ignored author is removed');
              continue;
            }
          }
          if(mainSettings.data['favorite subsites'].find(a => a.authorID === getInfo(arr[i].querySelector(`.content-header-author--subsite`).children[0].href).authorID)){
            console.log('I see favorite subsite!');
            arr[i].classList.add('favoriteSubsite');
          }
          if(mainSettings.data['ignored subsites'].find(a => a.authorID === getInfo(arr[i].querySelector(`.content-header-author--subsite`).children[0].href).authorID)){
            console.log('I see ignored subsite!');
            if(mainSettings['ignored subsites']['what to do with ignored subsites'] === 'collapse'){
              arr[i].classList.add('ignoredSubsite', 'collapsed');
            }else{
              arr[i].remove();
              console.log('Ignored subsite is removed');
              continue;
            }
          }
          if(arr[i].querySelector(`div[class=content-container]`)){
            // console.log(arr[i].querySelector(`div[class=content-container]`).children[0].classList.value);
            if(mainSettings['feeds subsites title filter']['filter enabled']){
              if(mainSettings['feeds subsites title filter']['block without title']){
                if(!arr[i].querySelector(`div[class=content-container]`).children[0].classList.value.match(/content-title/)){
                  console.log('NO TITLE!', arr[i]);
                  if(mainSettings['feeds subsites title filter']['how to block subsites title'] === 'collapse'){
                    arr[i].classList.add('subsiteBlockedByNoTitle', 'collapsed');
                  }else{
                    arr[i].remove();
                    console.log('Subsite feed removed1', arr[i]);
                    continue;
                  }
                }
              }
              if(mainSettings['feeds subsites title filter']['block with text in title'] && subsitesTitleFilter){
                // let subsitesTitleFilter = new RegExp(mainSettings['feeds subsites title filter']['words'].join('|'), 'mi');
                if(arr[i].querySelector(`div[class=content-container]`).children[0].classList.value.match(/content-title/)){
                  console.log('Title: ', arr[i].querySelector(`div[class=content-container]`).children[0].textContent.trim());
                  if(arr[i].querySelector(`div[class=content-container]`).children[0].textContent.trim().match(subsitesTitleFilter)){
                    console.log('Subsutes title filter found item!', arr[i].querySelector(`div[class=content-container]`).children[0].textContent.trim());
                    if(mainSettings['feeds subsites title filter']['how to block subsites title'] === 'collapse'){
                      arr[i].classList.add('subsiteBlockedByTitle', 'collapsed');
                    }else{
                      arr[i].remove();
                      console.log('Subsite feed removed2', arr[i]);
                      continue;
                    }
                  }
                }
              }
            }
            if(mainSettings['feeds subsites text filter']['filter enabled']){
              if(mainSettings['feeds subsites text filter']['block without text']){
                if(!arr[i].querySelector(`div[class=content-container] p`)){
                  console.log('NO TEXT!', arr[i]);
                  if(mainSettings['feeds subsites text filter']['how to block subsites text'] === 'collapse'){
                    arr[i].classList.add('subsiteBlockedByNoText', 'collapsed');
                  }else{
                    arr[i].remove();
                    console.log('Subsite feed removed1', arr[i]);
                    continue;
                  }
                }
              }
              if(mainSettings['feeds subsites text filter']['block with some text'] && subsitesTextFilter){
                // let subsitesTitleFilter = new RegExp(mainSettings['feeds subsites title filter']['words'].join('|'), 'mi');
                if(arr[i].querySelector(`div[class=content-container] p`)){
                  if(arr[i].querySelector(`div[class=content-container] p`).textContent.trim().match(subsitesTextFilter)){
                    console.log('Subsites text filter found item!', arr[i].querySelector(`div[class=content-container] p`).textContent.trim());
                    if(mainSettings['feeds subsites text filter']['how to block subsites text'] === 'collapse'){
                      arr[i].classList.add('subsiteBlockedByText', 'collapsed');
                    }else{
                      arr[i].remove();
                      console.log('Subsite feed removed2', arr[i]);
                      continue;
                    }
                  }
                }
              }
            }
            // console.log(arr[i].querySelector(`div[class=content-container]`).children[0].textContent)
            // if(arr[i].querySelector(`div[class=content-container]`).children[0].textContent.match(/[^]+/)){
              // arr[i].classList.toggle('ignoredFeed');
            // }
          }

          new FeedActions(arr[i].querySelector(`div[class=content-header__info]`), arr[i]);
          if(mainSettings['working mode']['type'].match(/panel$/)){
            if(mainSettings['what to group']['subsites']){
              new SubGroup(
                document.getElementById('dtf-feedGroups').children[1].children[1],
                arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[0].children[0].getAttribute('data-image-src'),
                arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[1].textContent, arr[i]
              );

              if(arr[i].classList.value.match(/favoriteSubsite/)){
                arr[i].parentNode.parentNode.classList.add('favoriteSubsite');
              }
            }else{
              document.getElementById('dtf-feedGroups').children[1].children[1].appendChild(arr[i]);
            }
          }else
          if(mainSettings['working mode']['type'].match(/obs$/)){
            document.getElementById('dtf-feedGroups').appendChild(arr[i]);
          }
          // console.log(arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[1].textContent);
          // console.log(arr[i].querySelector(`div[class=content-header__info]`).children[1])
          // new FeedActions(arr[i].querySelector(`div[class=content-header__info]`));
          // document.getElementById('dtf-feedGroups').children[2].children[1].appendChild(arr[i]);
          // new SubGroup(document.getElementById('dtf-feedGroups').children[1].children[1], arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[1].textContent, arr[i]);
        }
        // if(co[d].classList.value.match(/content-header-author/)) console.log(co[d])
      }
      if(mainSettings['working mode']['type'].match(/panel$/)){
        document.getElementById('dtf-feedGroups').children[1].children[0].children[1].textContent = document.getElementById('dtf-feedGroups').children[1].children[1].children.length;
        document.getElementById('dtf-feedGroups').children[2].children[0].children[1].textContent = document.getElementById('dtf-feedGroups').children[2].children[1].children.length;
      }
    }
  }
// ==UserScript==
// @name        DTF feeds (lib)
// @namespace   https://github.com/TentacleTenticals/DTF-feeds
// @match       https://dtf.ru/*
// @grant       none
// @version     1.0
// @author      Jafia
// @description Классы
// ==/UserScript==

class Settings {
  constructor(params){
    if(document.getElementById('DTF-scriptSettings')) return;
    this.main=document.createElement('div');
    this.main.className='DTF-scriptSettings';
    this.main.id='DTF-scriptSettings';
    document.body.appendChild(this.main);

    this.header=document.createElement('div');
    this.header.className='header';
    this.main.appendChild(this.header);

    this.title=document.createElement('div');
    this.title.className='title';
    this.title.textContent=`Настройки ${initCfg.name}`;
    this.title.style=`
      text-align: center;
      font-weight: 500;
      padding: 5px 0px 0px 0px;`;
    this.header.appendChild(this.title);

    new Button({
      path: this.header,
      text: '❌',
      title: 'Закрыть настройки',
      onclick: () => {
        this.main.remove();
      }
    })

    this.form=document.createElement('form');
    this.form.id='settings';
    this.form.action='';
    this.form.method='dialog';
    this.form.onsubmit=() => {
      // this.main.remove();
    }
    this.main.appendChild(this.form);

    params(this.form);

    this.dataActions = new Field({
      path: this.form,
      cName: 'textInfo',
      dontRead: true,
      groupName: 'data actions',
      legend: `Управление сохранёнными данными`,
      inputs: [
        {
          type: 'file',
          name: 'load backup settings',
          title: 'Загрузка настроек из .txt файла',
          accepted: '.txt',
          text: 'Загрузить настройки из бэкапа',
          onchange: (e) => {
            readSettingsBackup(this.submit, e);
          }
        }
      ]
    });

    // this.backupSettings=document.createElement('button');
    // this.backupSettings.className='btn';
    // this.backupSettings.textContent='Бэкап настроек в файл';
    // this.backupSettings.style=`
    //   width: 100%;
    //   box-shadow: 0px 0px 2px 0px black;
    //   cursor: pointer;
    // `;
    // this.backupSettings.onclick=() => {
    //   backupSettingsToFile(JSON.stringify(mainSettings, null, 0), 'DTF feeds settings.txt', 'text/plain');
    // }
    // this.main.appendChild(this.backupSettings);

    new Button({
      path: this.dataActions,
      text: 'Бэкап настроек в файл',
      title: 'Сохранение настроек в .txt файл',
      onclick: () => {
        backupSettingsToFile(JSON.stringify(mainSettings, null, 2), `${initCfg.name} ${new Date()} (бэкап настроек).txt`, 'text/plain');
      }
    })

    // this.injectSettingsBackup=document.createElement('button');
    // this.injectSettingsBackup.className='btn';
    // this.injectSettingsBackup.textContent='Бэкап настроек в файл';
    // this.injectSettingsBackup.style=`
    //   width: 100%;
    //   box-shadow: 0px 0px 2px 0px black;
    //   cursor: pointer;
    // `;
    // this.backupSettings.onclick=() => {
    //   readSettingsBackup();
    // }
    // this.main.appendChild(this.injectSettingsBackup);

    this.buttonContainer=document.createElement('div');
    this.buttonContainer.style=`display: grid;
    grid-template-columns: repeat(3, auto);
    justify-content: center;
    /* row-gap: 5px; */
    column-gap: 5px;
    margin-top: 3px;`;
    this.form.appendChild(this.buttonContainer);

    this.submit=document.createElement('input');
    this.submit.type='submit';
    this.submit.id='saveSettings';
    this.submit.value='Сохранить настройки';
    this.submit.onclick=() => {
      settingsUpdater(db, getSettings(document.querySelectorAll(`div[class=DTF-scriptSettings] fieldset`)), {firstRun: false});
      this.main.remove();
    }
    this.buttonContainer.appendChild(this.submit);

    this.backToDefault=document.createElement('input');
    this.backToDefault.type='submit';
    this.backToDefault.value='Сбросить настройки';
    this.backToDefault.title='Сбросить к дефолту. Для сохранения настроек, повторно откройте меню и сохраните настройки.'
    this.backToDefault.onclick=() => {
      mainSettings = defaultSettings;
      console.log(`Сброшены настройки, десу.`, mainSettings);
    }
    this.buttonContainer.appendChild(this.backToDefault);
  }
};
  class ScriptInfo {
    constructor(body){
      if(document.getElementById('DTF-scriptInfo')) return;
      this.main=document.createElement('div');
      this.main.className='DTF-scriptInfo';
      this.main.id='DTF-scriptInfo';
      document.body.appendChild(this.main);

      this.header=document.createElement('div');
      this.header.className='header';
      this.main.appendChild(this.header);

      new Button({
        path: this.header,
        text: '❌',
        title: 'Закрыть инфо',
        onclick: () => {
          this.main.remove();
        }
      });

      this.title=document.createElement('div');
      this.title.className='title';
      this.title.textContent=`Справка ${initCfg.name}`;
      this.title.style=`
        text-align: center;
        font-weight: 500;
        padding: 5px 0px 0px 0px;`;
      this.header.appendChild(this.title);

      body(this.main);
    }
  }
  class ScriptData {
    constructor(body){
      if(document.getElementById('DTF-scriptData')) return;
      this.main=document.createElement('div');
      this.main.className='DTF-scriptData';
      this.main.id='DTF-scriptData';
      document.body.appendChild(this.main);

      this.header=document.createElement('div');
      this.header.className='header';
      this.main.appendChild(this.header);

      this.title=document.createElement('div');
      this.title.className='title';
      this.title.textContent=`Данные ${initCfg.name}`;
      this.title.style=`
        text-align: center;
        font-weight: 500;
        padding: 5px 0px 0px 0px;`;
      this.header.appendChild(this.title);

      new Button({
        path: this.header,
        text: '❌',
        title: 'Закрыть данные',
        onclick: () => {
          this.main.remove();
        }
      })

      body(this.main);

      this.form=document.createElement('form');
      this.form.id='settings';
      this.form.action='';
      this.form.method='dialog';
      this.form.onsubmit=() => {
        // this.main.remove();
      }
      this.main.appendChild(this.form);

      this.dataActions = new Field({
        path: this.form,
        dontRead: true,
        cName: 'textInfo',
        groupName: 'data actions',
        legend: `Управление сохранёнными данными`
      });

      new Button({
        path: this.dataActions,
        text: 'Бэкап настроек в файл',
        title: 'Сохранение настроек в .txt файл',
        onclick: () => {
          backupSettingsToFile(JSON.stringify(mainSettings, null, 2), `${initCfg.name} ${new Date()} (бэкап настроек).txt`, 'text/plain');
        }
      })

      this.buttonContainer=document.createElement('div');
      this.buttonContainer.style=`display: grid;
      grid-template-columns: repeat(3, auto);
      justify-content: center;
      /* row-gap: 5px; */
      column-gap: 5px;
      margin-top: 3px;`;
      this.form.appendChild(this.buttonContainer);

      this.submit=document.createElement('input');
      this.submit.type='submit';
      this.submit.id='saveSettings';
      this.submit.value='Сохранить настройки';
      this.submit.onclick=() => {
        settingsUpdater(db, getSettings(document.querySelectorAll(`div[class=DTF-scriptData] fieldset`), true), {firstRun: false});
        this.main.remove();
      }
      this.buttonContainer.appendChild(this.submit);

      // body(this.form);
    }
  }
// ==UserScript==
// @name        Init
// @namespace   https://github.com/TentacleTenticals/DTF-feeds
// @match       https://dtf.ru/*
// @grant       none
// @version     1.0
// @author      Tentacle Tenticals
// @description Файлик инициализации скрипта
// @homepage https://github.com/TentacleTenticals/DTF-feeds
// @license MIT
// ==/UserScript==
/* jshint esversion:8 */

let mainSettings;
let defaultSettings = {
  ['working mode']: {
    ['type']: 'obs'
  },
  ['obs comments']: {
    ['is active']: false,
    ['block links']: false,
    ['block text']: false,
    ['link words']: [],
    ['text words']: []
  },
  ['what to group']: {
    ['subsites']: true,
    ['blogs']: true
  },
  ['where to react']: {
    ['popular']: true,
    ['popular types']: 'blogs and subsites',
    ['new']: true,
    ['new types']: 'blogs and subsites',
    ['my new']: true,
    ['my new types']: 'blogs and subsites',
    ['subsites']: true,
    ['subsites types']: 'blogs and subsites',
    ['user pages']: true,
    ['user pages types']: 'blogs and subsites',
    ['topics']: true,
    ['topics types']: 'blogs and subsites'
  },
  ['ignored authors']: {
    ['what to do with ignored authors']: 'collapse'
  },
  ['watched feeds']: {
    ['what to do with watched feeds']: 'collapse'
  },
  ['ignored feeds']: {
    ['what to do with ignored feeds']: 'collapse'
  },
  ['ignored subsites']: {
    ['what to do with ignored subsites']: 'collapse'
  },
  ['feeds blogs title filter']: {
    ['filter enabled']: false,
    ['block without title']: false,
    ['block with some text']: false,
    ['how to block blogs title']: 'collapse',
    ['words']: []
  },
  ['feeds blogs text filter']: {
    ['filter enabled']: false,
    ['block without text']: false,
    ['block with some text']: false,
    ['how to block blogs text']: 'collapse',
    ['words']: []
  },
  ['feeds subsites title filter']: {
    ['filter enabled']: false,
    ['block without title']: false,
    ['block with some text']: false,
    ['how to block subsites title']: 'collapse',
    ['words']: []
  },
  ['feeds subsites text filter']: {
    ['filter enabled']: false,
    ['block without text']: false,
    ['block with some text']: false,
    ['how to block subsites text']: 'collapse',
    ['words']: []
  },
  data: {
    ['watched feeds']: [],
    ['ignored feeds']: [],
    ['favorite authors']: [],
    ['ignored authors']: [],
    ['ignored subsites']: [],
    ['favorite subsites']: []
  }
};
// ==UserScript==
// @name        DTF settings classes
// @namespace   https://github.com/TentacleTenticals/dtf-libs
// @match       https://dtf.ru/*
// @grant       none
// @version     1.0
// @author      Tentacle Tenticals
// @description Классы настроек DTF скриптов. Используются для меню настроек
// @homepage https://github.com/TentacleTenticals/dtf-libs
// @license MIT
// ==/UserScript==
/* jshint esversion:8 */

// Класс для добавления CSS
class Css{
  constructor(title, style){
    this.css=document.createElement('style');
    title ? this.css.setAttribute('stylename', title) : '';
    this.css.textContent=style;
    document.body.appendChild(this.css);
  }
};

let style = `
.dtf-buttonsField {
  position: fixed;
  width: max-content;
  height: 100%;
  top: 0;
  right: 0;
  display: inline-flex;
  flex-direction: column;
  gap: 5px 0px;
  overflow: hidden;
  z-index: 10;
}

.dtf-buttonsField .dtf-alert {
  display: block;
  position: relative;
  top: 75px;
  right: calc(-100% + 250px);
  width: 240px;
  min-height: 100px;
  height: max-content;
  margin: 0px 15px 0px 0px;
  box-shadow: 0px 0px 3px 1px rgb(0 0 0);
  padding: 3px;
  animation-duration: 3s;
  animation-delay: 0s;
  animation-iteration-count: 1;
  animation-direction: alternate;
  animation-name: slideIn;
  opacity: 0.9;
}
.dtf-buttonsField .dtf-alert.hide {
  right: -101%;
  animation-duration: 3s;
  animation-delay: 0s;
  animation-iteration-count: 1;
  animation-direction: alternate;
  animation-name: slideOut;
}
.dtf-buttonsField .dtf-alert .type {
  width: max-content;
  font-size: 13px;
  font-weight: 600;
  padding: 0px 0px 0px 2px;
  border-radius: 3px;
}

.dtf-buttonsField .dtf-alert .text {
  padding: 3px;
  font-size: 15px;
  white-space: pre-wrap;
}
.dtf-buttonsField .dtf-alert .text::before {
  display: block;
  content: '';
  width: 100%;
  height: 4px;
  box-shadow: inset 0px 0px 3px 1px rgb(46 46 46);
}

.dtf-buttonsField .dtf-alert.err {
  background-color: rgb(229 140 140);
}
.dtf-buttonsField .dtf-alert.info {
  background-color: rgb(154 235 154);
}

@keyframes slideIn {
  from {
    right: -101%;
  }
  to {
    right: calc(-101% + 250px);
  }
}
@keyframes slideOut {
  from {
    right: calc(-101% + 250px);
  }
  to {
    right: -101%;
  }
}

.dtf-menuButton {
  display: flex;
  align-items: flex-end;
  cursor: pointer;
}
.dtf-menuButton .menuList {
  display: none;
  position: absolute;
  margin: 0px 0px 0px -5px;
}
.dtf-menuButton:hover .menuList,
.dtf-menuButton .menuList:hover {
  background: rgb(255 255 255);
  width: max-content;
  height: max-content;
  padding: 3px;
  display: flex;
  flex-direction: row;
  gap: 5px 5px;
  box-shadow: 0px 0px 2px 1px rgb(0 0 0);
  z-index: 10;
}

.DTF-scriptSettingsOpener {
  top: 19px;
  right: 257px;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-wrap: nowrap;
  z-index: 1000;
  color: rgb(0 0 0);
  padding: 2px 2px 2px 2px;
  line-height: unset;
  font-size: 19px;
  background: rgb(255 255 255);
  box-shadow: 0px 0px 2px 1px rgb(0 0 0);
  cursor: default;
}
.DTF-scriptSettingsOpener:hover {
    min-width: 171px;
}
.DTF-scriptSettingsOpener .label {
  display: none;
  position: absolute;
  float: left;
  font-size: 12px;
  text-align: center;
  top: 5px;
  left: 5px;
}
.DTF-scriptSettingsOpener:hover .label {
  display: block;
  min-width: 145px;
}
.DTF-scriptSettingsOpener .list {
  display: none;
  width: 100%;
  background: rgb(255,255,255);
  color: rbg(0,0,0);
}
.DTF-scriptSettingsOpener:hover .list,
.DTF-scriptSettingsOpener .list:hover {
  display: block;
  background: rgb(255,255,255);
  margin-top: 3px;
  padding: 1px 3px 3px 3px;
  box-shadow: 0px 0px 2px 1px rgb(0 0 0);
}
.DTF-scriptSettingsOpener .list button {
  background: rgb(216 234 249);
  font-size: 13px;
  border: 1px solid rgb(0 0 0);
  border-radius: 3px;
  padding: 1px 3px 1px 3px;
  cursor: pointer;
}
.DTF-scriptSettingsOpener .list .btn:hover {
  background: rgb(203 232 255);
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 115;
  background: rgb(255 255 255);
  padding: 3px;
  max-width: 50%;
  max-height: 100%;
  box-shadow: 0px 0px 2px 1px rgb(0 0 0);
  overflow-y: auto;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData)::-webkit-scrollbar {
  width: 9px;
  background: unset;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData)::-webkit-scrollbar-track {
  background: rgb(0 0 0 / 67%);
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData)::-webkit-scrollbar-track-piece {
  background-color: unset;
  border: 3px solid rgba(155, 105, 105, 0);
  border-radius: 0px;
  width: 1px;
  height: 1px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData)::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 18px;
  box-shadow: inset 0px 0px 0px 1px rgb(41 206 145 / 12%), inset 0px 0px 5px 1px rgb(255 255 255 / 70%), inset 0px 0px 0px 1px rgb(41 206 145 / 12%);
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData)::-webkit-scrollbar-corner {
  background-color: unset;
}


:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .header .title {
  text-align: center;
  font-weight: 500;
  padding: 5px 0px 0px;
}
.DTF-scriptSettingsOpener .container {
  display: grid;
  flex-direction: row;
  grid-template-columns: repeat(3, auto);
  column-gap: 5px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .header button {
  display: inline-block;
  font-size: 12px;
  position: absolute;
  top: 0px;
  right: 4px;
  padding: 0px 5px 1px 5px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) legend {
  font-weight: 500;
  font-size: 15px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) button {
  background-color: rgb(0 0 0);
  color: rgb(255 255 255);
  font-size: 14px;
  padding: 2px 3px 2px 3px;
  box-shadow: black 0px 0px 2px 0px;
  cursor: pointer;
  border: 1px solid rgb(255 255 255);
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) button:hover {
  background-color: rgb(62 27 78);
  text-shadow: 0px 0px 2px rgb(0 0 0);
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) input {
  width: max-content;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .input-label {
  font-size: 13px;
  position: relative;
  top: -2px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) fieldset {
  border: 1px solid black;
  margin: 5px 0px 5px 0px;
  padding: 3px;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .text {
  font-size: 13px;
  font-weight: 500;
  white-space: pre-wrap;
  line-height: 15px;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) ul::-webkit-scrollbar {
  width: 9px;
  background: unset;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) ul::-webkit-scrollbar-track {
  background: rgb(0 0 0 / 67%);
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) ul::-webkit-scrollbar-track-piece {
  background-color: unset;
  border: 3px solid rgba(155, 105, 105, 0);
  border-radius: 0px;
  width: 1px;
  height: 1px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) ul::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 18px;
  box-shadow: inset 0px 0px 0px 1px rgb(41 206 145 / 12%), inset 0px 0px 5px 1px rgb(255 255 255 / 70%), inset 0px 0px 0px 1px rgb(41 206 145 / 12%);
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) ul::-webkit-scrollbar-corner {
  background-color: unset;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.edit {
  max-height: 84px;
  display: flex;
  padding: 5px;
  margin: 3px 0px 3px 0px;
  gap: 7px 7px;
  border-radius: 3px;
  outline: unset;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  box-shadow: 0px 0px 3px 0px rgb(0 0 0);
  overflow-y: auto;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.edit li {
  min-width: 100px;
  max-width: max-content;
  border-radius: 3px;
  padding: 0px 4px 0px 3px;
  box-shadow: 0px 0px 4px 0px rgb(0 0 0);
  display: inline-block;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.edit li div {
  min-width: 65px;
  font-size: 14px;
  padding: 3px;
  outline: none;
  float: left;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.edit li button {
  border-radius: 50%;
  font-size: 10px;
  margin: 2px 0px 0px 0px;
  padding: 0px 2px 0px 2px;
  float: right;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) ul.itemsList.view {
  display: flex;
  grid-gap: 5px 5px;
  flex-wrap: wrap;
  margin: 5px 0px 5px 4px;
  border-left: 4px solid red;
  padding: 0px 0px 0px 6px;
  border-radius: 3px;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) ul.itemsList.view.hor {
  display: flex;
  grid-gap: 5px 5px;
  margin: 5px 0px 5px 4px;
  border-left: 4px solid red;
  padding: 0px 7px 0px 6px;
  border-radius: 3px;
  max-height: 200px;
  overflow-y: auto;
  justify-content: flex-start;
  flex-wrap: nowrap;
  flex-direction: column;
  overscroll-behavior: contain;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.view.hor li {
  display: flex;
  gap: 5px 5px;
  flex-direction: row;
  justify-content: space-between;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.view.hor .btnCont {
  flex-direction: row;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.view.fullHor {
  display: flex;
  gap: 5px 5px;
  padding: 3px 0px 3px 5px;
  max-height: 53px;
  overflow-y: auto;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.view.fullHor li {
  padding: 2px 2px 2px 2px;
  border-radius: 2px;
  box-shadow: 0px 0px 3px rgb(0 0 0);
  gap: 0px 6px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.view.fullHor .value {
  min-width: 50px;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList.view li {
  display: flex;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList .value {
  font-size: 13px;
  font-weight: 500;
  white-space: pre-wrap;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .view .hidden {
  display: none;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .view .btnCont {
  display: flex;
  flex-direction: column;
  margin: 0px 0px 0px 6px;
  grid-gap: 3px 3px;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList .btnCont.hor {
  flex-direction: row;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList .btnCont.ver {
  flex-direction: column;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList .btnCont.grid {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-gap: 0px 4px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList button {
  padding: 0px 2px 1px 2px;
  font-size: 10px;
  height: max-content;
  position: relative;
  border-radius: 50%;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList button.c1 {
  color: rgb(255 255 255);
  background-color: rgb(169 65 144);
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList {
  border-left: 4px solid red;
  border-radius: 3px 0px 0px 3px;
  padding: 0px 0px 0px 5px;
}
:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .itemsList .value {
  font-size: 13px;
  font-weight: 500;
  line-height: 15px;
  white-space: pre-wrap;
  outline: none;
}

:is(.DTF-scriptSettings, .DTF-scriptInfo, .DTF-scriptData) .textInfo {
  display: flex;
  flex-direction: column;
  gap: 7px 5px;
}`;

new Css('DTF-scriptSettings', style);

// Активация при загрузке страницы
function onPageLoad(run){
  {
  const log = console.log.bind(console)
  console.log = (...args) => {
    if(Array.isArray(args)){
      if(args[0]){
        if(typeof args[0] === 'string'){
          if(args[0].match(/\[ Air \] Ready.*/)){
            run();
          }
        }
      }
    }
    log(...args);
  }}
};

// Класс открытия настроек
class SettingsOpener{
  constructor(){
    if(document.getElementById('DTF-scriptSettingsOpener')) return;
    this.main=document.createElement('div');
    this.main.className='DTF-scriptSettingsOpener';
    this.main.id='DTF-scriptSettingsOpener';
    document.body.appendChild(this.main);

    this.label=document.createElement('div');
    this.label.className='label';
    this.label.textContent='Настройки скриптов';
    this.main.appendChild(this.label);

    this.header=document.createElement('div');
    this.header.className='header';
    this.header.textContent='🛠️';
    this.main.appendChild(this.header);

    this.list=document.createElement('div');
    this.list.className='list';
    this.main.appendChild(this.list);
  }
};
// Итем класса открытия настроек
class SettingsItem{
  constructor(name, id, params){
    this.main=document.createElement('div');
    this.main.className='container';
    this.main.id=`stg-DTF-${id}`;
    document.getElementById('DTF-scriptSettingsOpener').children[2].appendChild(this.main);

    new Button({
      path: this.main,
      text: name,
      onclick: () => {
        new Settings(params);
      }
    });
    new Button({
      path: this.main,
      text: 'ℹ️',
      title: 'Справка скрипта',
      onclick: () => {
        new ScriptInfo((path) => {
          this.intro = new Field({
            path: path,
            cName: 'textInfo',
            groupName: 'info',
            legend: 'Введение'
          });

          new Div({
            path: this.intro,
            name: 'text',
            text: `Добро пожаловать. Данный скрипт создан для работы с фидами DTF.
Заметки о скрипте:`
          });
          new Ul({
            path: this.intro,
            cName: 'itemsList',
            name: 'powers',
            editable: false,
            buttons: false,
            view: true,
            target: [
              'Данный скрипт имеет настройки, сохраняемые в базе данных IndexedDB. Для полноценной работы скрипта, вашему браузеру нужна её поддержка',
              'Скрипт может работать и без базы данных на своих стандартных настройках, но тогда вы не сможете помечать фиды, пользователей и подсайты',
              'Данный скрипт не использует DTF API - все возможности скрипта основаны чисто на HTML+JS+CSS, и базе данных IndexedDB',
              '"Алертер", который оповещает о разной информации и ошибках скрипта. Пока что, почти все оповещения идут в консоль',
              'Фильтрация по "статьи/блоги" на две отдельных вкладки',
              'Фильтрация по подсайтам. Каждый подсайт имеет свою отдельную вкладку',
              'Фильтрация по авторам (блоги). Каждый автор блога имеет свою отдельную вкладку',
              'RegExp фильтрация фидов по заголовкам (блокировка фидов если нет заголовка/есть определённый текст в заголовке)',
              'RegExp фильтрация фидов по тексту (блокировка фидов если нет текста/есть определённый текст)',
              'Настройка срабатывания в Популярное/Свежее/Моя лента/Страница пользователя/Фиды под статьями',
              'Показ/скрытие блогов/статей в Популярное/Свежее/Моя лента/Страница пользователя/Фиды под статьями',
              'Сворачивание фидов. Фид просто сворачивается для экономии места и/или если пользователь в нём не заинтересован',
              'Удаление фидов. Удаляется сам элемент фида из текущего списка фидов',
              'Пометка фидов как "прочитано". Фиды с подобной меткой всегда свёрнуты',
              'Пометка фидов как "игнорируется". Фиды с подобной меткой всегда свёрнуты',
              'Пометка авторов как "избранное". Статьи и блоги от избранных авторов всегда выделяются цветом',
              'Пометка авторов как "игнорируется". Статьи и блоги от игнорированных авторов всегда свёрнуты',
              'Пометка подсайтов как "избранное". Статьи в избранных подсайтах всегда выделяются цветом',
              'Пометка подсайтов как "игнорируется". Статьи в игнорируемых подсайтах всегда выделяются цветом',
              'Все вышеперечисленные действия с фидами, доступны через новые кнопки фидов. Не нужно бродить по меню',
              'Настройка поведения при нахождении прочитанных/игнорируемых фидов/авторов - свернуть/удалить',
              'Окна настройки, справки и данных скрипта',
              'Окно настроек служит для сохранения и импорта/экспорта настроек',
              'Окно данных служит для просмотра сохранённых данных скрипта, и очистки/удаления по одному элементу',
              'Данные скрипта хранятся в единой базе данных вместе с настройками, поэтому импорт/экспорт настроек переносит и данные',
              'Скрытие ссылок/текста комментариев в боковой панели, если они соответствуют фильтру. В РАЗРАБОТКЕ'
            ]
          });
          new Div({
            path: this.intro,
            name: 'text',
            text: `Скрипт имеет два режима работы - панель фидов и обсервер.
Совместный режим ПОКА НЕ ТЕСТИРОВАН.`
          });
          this.feedsInstruction = new Field({
            path: path,
            cName: 'textInfo',
            groupName: 'feedsInstruction',
            legend: 'Инструкция (панель фидов)'
          });
          new Div({
            path: this.feedsInstruction,
            name: 'text',
            text: `Панель фидов добавляется на каждую страницу, где приписана активация скрипта в "где срабатывать".
Первая порция фидов всегда сортируется автоматически при загрузке страницы, или при переходе по ссылкам DTF.

Когда панель фидов активна, она сворачивает отсортированные фиды, что приводит к подгрузке новых фидов.

Для дальнейшей сортировки фидов, нужно нажать кнопку "сортировки фидов" - таким образом, можно просмотреть/отсортировать приличное количество фидов.`
          });
          new Ul({
            path: this.feedsInstruction,
            cName: 'itemsList',
            name: 'feedsInstruction',
            text: 'Отличия панели фидов от обсервера',
            editable: false,
            buttons: false,
            view: true,
            target: [
              'Фиды сортируются по категориям "подсайты/блоги"',
              'Категории "подсайтов/блогов" в свою очередь имеют подкатегории',
              'Все фиды перекидываются в категории, отчего списки фидов сильно ужимаются. Это позволяет быстро просмотреть множество фидов'
            ]
          });
          this.obsInstruction = new Field({
            path: path,
            cName: 'textInfo',
            groupName: 'obsInstruction',
            legend: 'Инструкция (обсервер)'
          });
          new Div({
            path: this.obsInstruction,
            name: 'text',
            text: `Для стандартной работы скрипта, достаточно лишь активного обсервера.
Каждый раз, когда подгружаются новые фиды (при скролле страницы), обсервер обрабатывает их все автоматически.`
          });
          new Ul({
            path: this.obsInstruction,
            cName: 'itemsList',
            name: 'observer',
            text: 'Отличия обсервера от панели фидов',
            editable: false,
            buttons: false,
            view: true,
            target: [
              'Фиды идут стандартным списком',
              'Отсутствует фильтрация по подсайтам/авторам (блоги)'
            ]
          });
          this.filtering = new Field({
            path: path,
            cName: 'textInfo',
            groupName: 'filtering',
            legend: 'Написание RegExp фильтров для фильтрации',
          });
          new Div({
            path: this.filtering,
            name: 'text',
            text: `Фильтрация по RegExp фильтрам работает по всем правилам RegExp.

Для создания фильтра, ткните мышью на пустое место в списке,
после чего напишите нужное слово/фразу/Regex значение.

Для добавления нового слова/фразы/RegExp значения, нажмите мышью на уже написанное значение, после чего нажмите "Enter".
Для удаления значения, нажмите кнопку справа от значения.
Для сохранения изменений, обязательно нажмите кнопку сохранения настроек.`
          });
        });
      }
    });
    new Button({
      path: this.main,
      text: '💾',
      title: 'Список сохранённых данных скрипта',
      onclick: () => {
        new ScriptData((path) => {
          function desu({legend, name, format, buttons, target}){
            let field = new Field({
              path: path,
              groupName: 'data',
              legend: legend
            });
            let itemsList = new Ul({
              path: field,
              cName: 'itemsList view hor',
              name: name,
              returnE: true,
              valueName: 'string',
              editable: false,
              buttons: buttons,
              view: true,
              format: format,
              target: target
            });
            new Button({
              path: field,
              text: 'Delete all',
              title: 'Удалить все элементы',
              onclick: () => {
                itemsList.children[0].replaceChildren();
              }
            })
          }

          desu({
            legend: `📖 Список просмотренных фидов (${mainSettings['data']['watched feeds'].length})`,
            name: 'watched feeds',
            format: (item) => {
              return `📛: ${item.author}
🆔: ${item.feedID}
📜: ${item.feedTitle||'-'}
⌚: ${item.date||'-'}`
            },
            buttons: (q, i) => {
              new Button({
                path: q,
                name: 'c1',
                text: '🔗',
                title: 'Перейти на страницу статьи',
                onclick: () => {
                  window.open(`https://dtf.ru/${(() => {
                    if(i.authorType.match(/User$/)){
                      return `u/${i.authorType.match(/User$/) ? `${i.authorID}/${i.feedID}` : `${i.authorID}/${i.feedID}`}`;
                    }else
                    if(i.authorType.match(/Official subsite|User subsite/)){
                      return `s /${i.authorType.match(/Official subsite|User subsite/) ? `${i.authorID}/${i.feedID}` : `${i.authorID}/${i.feedID}`}`;
                    }else
                    if(i.authorType.match(/DTF Subsite/)){
                      return i.authorID;
                    }
                  })()}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '🔗',
                title: 'Перейти на страницу автора',
                onclick: () => {
                  window.open(`https://dtf.ru/${i.authorType.match(/User$/) ? 'u': 's'}/${i.authorID}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '❌',
                title: 'Удалить элемент',
                onclick: () => {
                  q.parentNode.remove();
                }
              })
            },
            target: mainSettings['data']['watched feeds']
          })

          desu({
            legend: `📖🚫 Список игнорированных фидов (${mainSettings['data']['ignored feeds'].length})`,
            name: 'ignored feeds',
            format: (item) => {
              return `📛: ${item.author}
🆔: ${item.feedID}
📜: ${item.feedTitle||'-'}
⌚: ${item.date||'-'}`
            },
            buttons: (q, i) => {
              new Button({
                path: q,
                name: 'c1',
                text: '🔗',
                title: 'Перейти на страницу статьи',
                onclick: () => {
                  window.open(`https://dtf.ru/${(() => {
                    if(i.authorType.match(/User$/)){
                      return `u/${i.authorType.match(/User$/) ? `${i.authorID}/${i.feedID}` : `${i.authorID}/${i.feedID}`}`;
                    }else
                    if(i.authorType.match(/Official subsite|User subsite/)){
                      return `s /${i.authorType.match(/Official subsite|User subsite/) ? `${i.authorID}/${i.feedID}` : `${i.authorID}/${i.feedID}`}`;
                    }else
                    if(i.authorType.match(/DTF Subsite/)){
                      return i.authorID;
                    }
                  })()}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '🔗',
                title: 'Перейти на страницу автора',
                onclick: () => {
                  window.open(`https://dtf.ru/${i.authorType.match(/User$/) ? 'u': 's'}/${i.authorID}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '❌',
                title: 'Удалить элемент',
                onclick: () => {
                  q.parentNode.remove();
                }
              })
            },
            target: mainSettings['data']['ignored feeds']
          })

          desu({
            legend: `💘 Список избранных авторов (${mainSettings['data']['favorite authors'].length})`,
            name: 'favorite authors',
            format: (item) => {
              return `📛: ${item.author}
🆔: ${item.authorID}
👹: ${item.authorType}`
            },
            buttons: (q, i) => {
              new Button({
                path: q,
                text: '🔗',
                title: 'Перейти на страницу автора',
                onclick: () => {
                  window.open(`https://dtf.ru/${i.authorType.match(/User$/) ? 'u': 's'}/${i.authorID}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '❌',
                title: 'Удалить элемент',
                onclick: () => {
                  q.parentNode.remove();
                }
              })
            },
            target: mainSettings['data']['favorite authors']
          })

          desu({
            legend: `💢 Список игнорируемых авторов (${mainSettings['data']['ignored authors'].length})`,
            name: 'ignored authors',
            format: (item) => {
              return `📛: ${item.author}
🆔: ${item.authorID}
👹: ${item.authorType}`
            },
            buttons: (q, i) => {
              new Button({
                path: q,
                text: '🔗',
                title: 'Перейти на страницу автора',
                onclick: () => {
                  window.open(`https://dtf.ru/${i.authorType.match(/User$/) ? 'u': 's'}/${i.authorID}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '❌',
                title: 'Удалить элемент',
                onclick: () => {
                  q.parentNode.remove();
                }
              })
            },
            target: mainSettings['data']['ignored authors']
          })

          desu({
            legend: `💘 Список избранных подсайтов (${mainSettings['data']['favorite subsites'].length})`,
            name: 'favorite subsites',
            format: (item) => {
              return `📛: ${item.author}
🆔: ${item.authorID}
👹: ${item.authorType}`
            },
            buttons: (q, i) => {
              new Button({
                path: q,
                text: '🔗',
                title: 'Перейти на страницу подсайта',
                onclick: () => {
                  window.open(`https://dtf.ru/${i.authorType.match(/User$/) ? 'u': 's'}/${i.authorID}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '❌',
                title: 'Удалить элемент',
                onclick: () => {
                  q.parentNode.remove();
                }
              })
            },
            target: mainSettings['data']['favorite subsites']
          })

          desu({
            legend: `💢 Список игнорируемых подсайтов (${mainSettings['data']['ignored subsites'].length})`,
            name: 'ignored subsites',
            format: (item) => {
              return `📛: ${item.author}
🆔: ${item.authorID}
👹: ${item.authorType}
⌚: ${item.date||'-'}`
            },
            buttons: (q, i) => {
              new Button({
                path: q,
                text: '🔗',
                title: 'Перейти на страницу подсайта',
                onclick: () => {
                  window.open(`https://dtf.ru/${i.authorType.match(/User$/) ? 'u': 's'}/${i.authorID}`, '_blank').focus();
                }
              })
              new Button({
                path: q,
                text: '❌',
                title: 'Удалить элемент',
                onclick: () => {
                  q.parentNode.remove();
                }
              })
            },
            target: mainSettings['data']['ignored subsites']
          })
          // desu({
          //   legend: '',
          //   text: '',
          //   format: '',
          //   buttons: '',
          //   target: ''
          // })
          // desu({
          //   legend: '',
          //   text: '',
          //   format: '',
          //   buttons: '',
          //   target: ''
          // })
          // desu({
          //   legend: '',
          //   text: '',
          //   format: '',
          //   buttons: '',
          //   target: ''
          // })

        });
      }
    });

    // this.main=document.createElement('button');
    // this.main.className='btn';
    // this.main.id=`stg-DTF-${id}`;
    // this.main.textContent=name;
    // this.main.onclick=() => {
    //   new Settings(params);
    // }
    // document.getElementById('DTF-scriptSettingsOpener').children[2].appendChild(this.main);
  }
};

// Классы построения настроек
class Input{
  constructor({path, type, name, id, title, value, accepted, pattern, min, max, step, checked, disabled, required, auto, onchange, onfocus, onblur, text, iText, n}){
    this.div=document.createElement('div');
    path.appendChild(this.div);
    this.input=document.createElement('input');
    this.input.className='input';
    this.input.name=name;
    this.input.type=type;
    id ? this.input.id=id : '';
    title ? this.input.title=title : '';
    required ? this.input.setAttribute('required', '') : '';
    checked ? this.input.checked=checked : '';
    disabled ? this.input.disabled=true : '';
    value ? this.input.value=value : '';
    accepted ? this.input.accepted=accepted : '';
    pattern ? this.input.pattern=pattern : '';
    min ? this.input.min=min : '';
    max ? this.input.max=max : '';
    step ? this.input.step=step : '';
    auto ? this.input.autocomplete=auto : '';
    onchange ? this.input.onchange=onchange : '';
    onfocus ? this.input.onfocus=onfocus : '';
    onblur ? this.input.onblur=onblur : '';
    this.div.appendChild(this.input);

    this.inputName=document.createElement('label');
    this.inputName.className='input-label';
    text ? this.inputName.textContent=text : this.inputName.innerHTML=iText;
    this.div.appendChild(this.inputName);
    if(n) new NewLine(path)

    return this.input;
  }
};
class Select{
  constructor({path, label, name, value, options}){
    this.div=document.createElement('div');
    path.appendChild(this.div);
    this.main=document.createElement('select');
    this.main.name=name;
    this.div.appendChild(this.main);

    options.forEach(e => {
      new Option({
        path: this.main,
        text: e
      })
    })
    this.main.value=value;

    this.label=document.createElement('label');
    this.label.textContent=label;
    this.div.appendChild(this.label);
  }
};
class Option{
  constructor({path, text}){
    this.main=document.createElement('option');
    this.main.textContent=text;
    path.appendChild(this.main);
  }
};
class Field{
  constructor({path, groupName, cName, dontRead, legend, inputs, select, style}){
    this.field=document.createElement('fieldset');
    this.field.groupName=this.field.setAttribute('groupName', groupName);
    dontRead ? this.field.setAttribute('dontread', true) : '';
    cName ? this.field.className=cName : '';
    if(style) this.field.style=style;
    path.appendChild(this.field);

    if(legend){
      this.legend=document.createElement('legend');
      this.legend.textContent=legend;
      this.legend.onclick=() => {
        this.field.classList.toggle('show');
      }
      this.field.appendChild(this.legend);
    }

    if(inputs) inputs.forEach(e => {
      new Input({
        path: this.field,
        type: e.type,
        name: e.name,
        title: e.title,
        value: e.value,
        accepted: e.accepted,
        number: e.number,
        min: e.min,
        max: e.max,
        step: e.step,
        checked: e.checked,
        text: e.text,
        iText: e.iText,
        onchange: e.onchange,
        num: e.num
      })
    })

    if(select) select.forEach(e => {
      new Select({
        path: this.field,
        label: e.label,
        name: e.name,
        value: e.value,
        options: e.options
      })
    })
    return this.field;
  }
};
class Ul{
  constructor({path, name, cName, valueName, text, returnE, view, editable, buttons, target, format, onkeydown, onblur}){
    this.main=document.createElement('div');
    path.appendChild(this.main);

    this.list=document.createElement('ul');
    cName ? this.list.className=cName : this.list.className='list';
    name ? this.list.setAttribute('name', name) : '';
    // editable ? this.list.setAttribute('contenteditable', '') : '';
    if(onkeydown) this.list.onkeydown=onkeydown;
    this.main.appendChild(this.list);

    if(!target.length > 0) new Li({
      path: this.list,
      editable: editable,
      buttons: buttons,
      valueName: valueName,
      onblur: onblur
    });
    else{
      for(let i = 0; i < target.length; i++){
        new Li({
          path: this.list,
          editable: editable,
          buttons: buttons,
          value: target[i],
          valueName: valueName,
          onblur: onblur,
          text: view ? (format ? format(target[i]) : target[i]) : target[i]
        });
      }
    }

    this.inputName=document.createElement('label');
    this.inputName.className='input-label';
    text ? this.inputName.textContent=text : '';
    this.main.appendChild(this.inputName);
    if(returnE) return this.main;
  }
}
class Li{
  constructor({path, editable, buttons, text, value, valueName, onblur}){
    function getType(item){
      return Object.prototype.toString.call(item).slice(8, -1).toLowerCase();
    }
    this.main=document.createElement('li');
    // text ? this.main.textContent=text : '';
    // this.main.style=`
    // min-width: 10px;`
    path.appendChild(this.main);
    this.main.focus();
    if(text){
      if(getType(text) === 'array'){
        for(let i = 0; i < text.length; i++){
          new Div({
            path: this.main,
            name: 'value',
            text: text[i],
            editable: editable,
            valueName: valueName,
            onblur: onblur
          })
        }
      }else{
        new Div({
          path: this.main,
          name: 'value',
          text: text,
          editable: editable,
          valueName: valueName,
          onblur: onblur
        })
      }
    }else{
      new Div({
        path: this.main,
        name: 'value',
        editable: editable,
        valueName: valueName,
        onblur: onblur
      })
    }

    value && valueName ? this.main.setAttribute(valueName, getType(value).match(/object/) ? JSON.stringify(value) : value) : '';

    // this.value=document.createElement('div');
    // text ? this.value.textContent=text : '';
    // editable ? this.value.setAttribute('contenteditable', true) : '';
    // this.main.appendChild(this.value);

    if(buttons) buttons(new Div({
      path: this.main,
      returnE: true,
      name: 'btnCont'
    }), value);

    // if(buttons) new Button({
    //   path: this.main,
    //   text: '❌',
    //   onclick: () => {
    //     this.main.remove();
    //   }
    // });

    return this.main;
  }
}
function fieldDisable(target){
  target.disabled = true;
  target.classList.toggle('show');
};

function getSettings(arr, mode){
  let o;
  if(mode){
    o = {
      ...mainSettings
    }
  }else o = {
    data: mainSettings.data
  }
  for(let i = 0; i < arr.length; i++){
    // console.log(arr)
    // if(arr[i].getAttribute('dontread')) console.log('Yox!', arr[i].getAttribute('dontread'));
    // if(!arr[i].getAttribute('dontread')) console.log('Fox!', arr[i].getAttribute('dontread'));
    if(!arr[i].getAttribute('dontread')){
      o[arr[i].getAttribute('groupName')] ? '' : o[arr[i].getAttribute('groupName')] = {};
      for(let item = 0, a = arr[i].children; item < a.length; item++){
        if(a[item].children[0]){
          if(a[item].children[0].tagName.match(/INPUT/)){
            a[item].children[0].type === 'checkbox' ? o[arr[i].getAttribute('groupName')][a[item].children[0].name] = a[item].children[0].checked : (a[item].children[0].checked ? o[arr[i].getAttribute('groupName')][a[item].children[0].name] = a[item].children[0].value : '');
          }
          // if(a[item].children[0].tagName.match(/SELECT/)){
          //   o[arr[i].getAttribute('groupName')][a[item].children[0].name] = (a[item].children[0].type === 'checkbox' ? a[item].children[0].checked : (a[item].children[0].checked ? a[item].children[0].value : ''));
          // }
          // if(a[item].children[0].tagName.match(/INPUT|SELECT/)){
          //   o[arr[i].getAttribute('groupName')][a[item].children[0].name] = (a[item].children[0].type === 'checkbox' ? a[item].children[0].checked : (a[item].children[0].checked ? a[item].children[0].value : ''));
          // }
          if(a[item].children[0].tagName.match(/UL/)){
            // console.log('UL: ', a[item].children[0]);
            let ulItems = [];
            for(let li = 0, ul = a[item].children[0].children; li < ul.length; li++){
              // console.log('ULLL: ', ul[li]);
              if(ul[li].getAttribute('value')) ulItems.push(JSON.parse(ul[li].getAttribute('value')));
              if(ul[li].getAttribute('string')) ulItems.push(ul[li].getAttribute('string'));
              // let textArr = [];
              // for(let val = 0, values = ul[li].children; val < values.length; val++){
              //   if(values[val].classList.value.match(/value/) && values[val].textContent.length > 1){
              //     textArr.push(values[val].textContent);
              //   }
              // }
              // console.log('TextArr:', textArr);
              // ulItems.push(JSON.parse(`{${textArr}}`));
              // if(ul[li].children[0].textContent.length > 1){
              //   ulItems.push(JSON.parse(`{${ul[li].children[0].textContent}}`));
              // }
            }
            console.log('UlItems: ', ulItems);
            o[arr[i].getAttribute('groupName')][a[item].children[0].getAttribute('name')] = ulItems;
            // console.log('Items: ', ulItems);
            // o[arr[i].getAttribute('groupName')][a[item].children[0].name] = () => {
            //   let ulItems = [];
            //   for(let li = 0, ul = a[item].children[0].children; li < ul.length; li++){
            //     console.log(ul[li]);
            //     ulItems.push(ul[li].textContent);
            //   }
            //   return ulItems;
            // }
            // console.log('UlItems: ', ulItems);
          }
        }
        // a[item].children[0] ? (a[item].children[0].tagName.match(/INPUT|SELECT/) ? o[arr[i].getAttribute('groupName')][a[item].children[0].name] = (a[item].children[0].type === 'checkbox' ? a[item].children[0].checked : a[item].children[0].value) : '') : '';
      }
    }
  }
  console.log('OO: ', o);
  return o;
}

// Функции для работы с CSS
function hexConverter(hex) {
  return `${parseInt(hex.substr(1,2), 16)} ${parseInt(hex.substr(3,2), 16)} ${parseInt(hex.substr(5,2), 16)}`
};
function rgbConverter(rgb) {
  rgb = rgb.split(' ');
  let color = {
    r: (+rgb[0]).toString(16),
    g: (+rgb[1]).toString(16),
    b: (+rgb[2]).toString(16)
  }

  if (color.r.length == 1)
    color.r = "0" + color.r;
  if (color.g.length == 1)
    color.g = "0" + color.g;
  if (color.b.length == 1)
    color.b = "0" + color.b;

  return `#${color.r}${color.g}${color.b}`;
};
function rgbaConverter(rgb, opacity){
  return `(${rgb} / ${opacity})`
};

// Функция инициализации скрипта
function init(settings, s, cfg){
  settings ? mainSettings = mergeSettings(defaultSettings, settings) : mainSettings = defaultSettings;
  new SettingsOpener();
  if(!document.getElementById(`stg-DTF-${s.id}`)) new SettingsItem(s.name, s.id, s.params);
  s.func(cfg);
  console.log(`[Init] Инициализация скрипта успешно выполнена.`, mainSettings);
};
;// ==UserScript==
// @name        DTF indexedDB
// @namespace   https://github.com/TentacleTenticals/dtf-libs
// @match       https://dtf.ru/*
// @grant       none
// @version     1.0
// @author      Tentacle Tenticals
// @description База данных DTF. Используется для хранения настроек скриптов и т.п
// @homepage https://github.com/TentacleTenticals/dtf-libs
// @license MIT
// ==/UserScript==
/* jshint esversion:8 */

  function dbGen(i){
    return {
      indexedDB: (window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB),
      name: "DTF scripts database",
      version: 1,
      store: i.storeName,
      key: "uid",
      data: {
        uid: 'settings',
        description: i.storeDesc
      }
    }
  }
// let db = {
//   indexedDB: (window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB),
//   name: "DTF scripts database",
//   version: 1,
//   store: initCfg.storeName,
//   key: "uid",
//   data: {
//     uid: 'settings',
//     description: initCfg.storeDesc
//   }
// };

async function connectDB(db, resolve, reject) {
  return new Promise((resolve, reject) => {
    var req = indexedDB.open(db.name, db.version);
    req.onsuccess = (ev) => {
      console.log('[connectDB] Success!');
      db.connect = ev.target.result;
      resolve({status:'success', type:'connect', msg:`[connectDB] Успешно установлено соединение с датабазой.`});
    }
    req.onupgradeneeded = (event) => {
      console.log('[connectDB] Upgrade!');
      db.connect = event.target.result;
      db.init = 1;
      if (!db.connect.objectStoreNames.contains(db.store)) {
        var store = db.connect.createObjectStore(db.store, { keyPath: db.key });
        store.transaction.oncomplete = (e) => {
          resolve({status:'success', type:'key writing', msg:`[createDB] ${db.name}, задача по записи ключа в базу данных успешно завершена.`});
        }
        store.transaction.onerror = (event) => {
          reject({status:'fail', msg:`[createDB] ${db.name}, ${event.request.errorCode}`});
        };
      }else{
        resolve({status:'sucess', msg:'key already here'})
      }
      // resolve({status:'success', type:'create/update', msg:`[connectDB] База данных успешно создана/обновлена до новой версии.`});
    }
    req.onerror = (e) => {
      console.log('[connectDB] Error!');
      reject({status:'fail', msg:e});
    }
  });
}
function createDB(db, data) {
  return new Promise((resolve, reject) => {
    if (!db.init) {
      resolve({status:'fail', type:'init', msg:`[createDB] ${db.name}, база данных не инициализирована.`})
    }
    if (!db.connect.objectStoreNames.contains(db.store)) {
      var store = db.connect.createObjectStore(db.store, { keyPath: db.key });
      store.transaction.oncomplete = (e) => {
        resolve({status:'success', type:'key writing', msg:`[createDB] ${db.name}, задача по записи ключа в базу данных успешно завершена.`});
      }
      store.transaction.onerror = (event) => {
        reject({status:'fail', msg:`[createDB] ${db.name}, ${event.request.errorCode}`});
      };
    }else{
      resolve({status:'sucess', msg:'key already here'})
    }
      // var trx = db.connect.transaction(db.store, "readwrite").objectStore(db.store);
      // // db.data.map(row => trx.add(row));
      // trx.add(data);
  });
}
function addToDB(db, data) {
  return new Promise((resolve, reject) => {
    var trx = db.connect.transaction([db.store], "readwrite").objectStore(db.store);
//     data.map(i => trx.add(i));
    trx.add(data);
    resolve({status:'success', type:'data writing', msg:`[addToDB] ${db.store}, задача по добавлению настроек в базу данных успешно завершена.`});
    trx.onerror = (e) => {
      reject(e);
    }
  });
};
async function readDB(db, key) {
  return new Promise((resolve, reject) => {
    var trx = db.connect.transaction([db.store], "readonly").objectStore(db.store);
    trx = trx.get(key);
    trx.onsuccess = (e) => {
      if (!e.target.result) {
        reject({status:'fail', type:'data search', msg:`[readDB] ${db.store}, id:${key} не найден!`});
      }else
      {
        console.log(`Запись в базе данных ${db.name} по id:${key} успешно найдена.`)
        resolve({status:'success', type:'data search', msg:`Запись в базе данных ${db.name} по id:${key} успешно найдена.`, data:e.target.result});
      }
    }
    trx.onerror = (e) => {
      reject(e);
    }
  });
}
function updateDataInDB(db, key, update) {
  return new Promise((resolve, reject) => {
    var trx = db.connect.transaction([db.store], "readwrite").objectStore(db.store);
    var req = trx.get(key);
    req.onsuccess = (e) => {
      if(e.target.result) {
        // console.log('RES', e.target.result)
        var data = e.target.result;
        Array.from(Object.keys(update)).map((i) => {
          data[i] = update[i];
        });
        var upd = trx.put(data);
        upd.onsuccess = (e) => {
          console.log(upd)
          resolve({status:'success', type:'data update', msg:`[updateDataInDB] ${db.name}, успешно обновлена запись по id:${key}.`});
        }
      }else
      {
        resolve({status:'fail', type:'data update', msg:`[updateDataInDB] ${db.store}, id:${key} не найден!`});
      }
    }
    trx.onerror = (e) => {
      reject(e);
    }
  });
}
function deleteFromDB(db, key) {
  return new Promise((resolve, reject) => {
    var trx = db.connect.transaction([db.store], "readwrite").objectStore(db.store);
    var req = trx.delete(key);
    console.log(`[deleteFromDB] ${db.name}, начата попытка удаления записи по id:${key}.`);
    req.onsuccess = () => {
      resolve({status:'success', type:'data deleting', msg:`[delDB] ${db.name}, запись под id:${key} успешно удалена.`});
    }
    trx.onerror = (e) => {
      reject(e);
    }
  });
}

async function settingsLoader(db, initCfg, cfg) {
  if(!db.indexedDB){
    console.log('Ваш браузер не поддерживает базу данных `indexedDB`, которую использует данный скрипт для хранения настроек.\nБудет использоваться дефолтный список настроек...если вы всё же хотите использовать свои собственные настройки, отредактируйте скрипт, импортировав в него свои настройки.');
    return init(false, initCfg, cfg);
  }else
  {
    if(!(await indexedDB.databases()).map(ind => ind.name).includes(db.name)){
      console.log(`[indexedDB] Базы данных ${db.name} не найдено. Будут использованы дефолтные настройки.`);
        return init(false, initCfg, cfg);
    }else{
      console.log(`[indexedDB] База данных ${db.name} существует. Сейчас я проверю её на наличие сохранённых настроек.`);
      connectDB(db)
      .then(() => {
        readDB(db, db.data.uid).then(res => {
          if(res.status === 'fail'){
            console.log(`[indexedDB] База данных ${db.name} существует, но нет сохранённых настроек. Будут использованы дефолтные настройки.`);
            init(false, initCfg, cfg);
          }else
          {
            console.log(`[indexedDB] В базе данных ${db.name} найдены сохранённые настройки, загружаю их.`);
            init(res.data.settings, initCfg, cfg);
          }
        }).catch(err => {
          console.log(err)
          console.log(`[indexedDB] Произошла ошибка, или база данных ${db.name} существует, но нет сохранённых настроек. Будут использованы дефолтные настройки.`);
          init(false, initCfg, cfg);
        })
      }).catch(err => console.log(err));
    }
  }
}
function settingsUpdater(db, settings, sfg){
  if(!db.indexedDB){
    console.log('Ваш браузер не поддерживает базу данных `indexedDB`, которую использует данный скрипт для хранения настроек.\nБудет использоваться дефолтный список настроек...если вы всё же хотите использовать свои собственные настройки, отредактируйте скрипт, импортировав в него свои настройки.');
    return
  }else
  {
    connectDB(db)
    .then(() => {
      readDB(db, db.data.uid).then(res => {
        if(res.status === 'success' && res.type === 'data search'){
          console.log(`В базе данных ${db.name} найдены сохранённые настройки. Будет выполнено обновление.`);
          updateDataInDB(db, db.data.uid, {...db.data, settings:settings}).then(res => {
            console.log('Upddated', res.status);
            init(settings, initCfg, sfg);
          }).catch(err => console.log(err))
        }
      }).catch(err => {
        if(err.status === 'fail'){
          console.log(`База данных ${db.name} существует, но не сохранённые настройки. Будут сохранены новые настройки.`);
          connectDB(db).then(res => {
            addToDB(db, {...db.data, settings:settings}).then(res => {
              console.log(res)
              init(settings, initCfg, sfg);
            }).catch(err => {
              console.log(err)
            });
          });
        }
      })
    }).catch(err => console.log(err));
  }
}
function mergeSettings(def, sav){
  function getType(item){
      return Object.prototype.toString.call(item).slice(8, -1).toLowerCase();
  }
  let tg = {};
  for(let item in def){
    if(getType(def[item]).match(/object/)){
      tg[item] = {};
      for(let i2 in def[item]){
        if(getType(def[item][i2]).match(/object/)){
          tg[item][i2] = {};
          for(let i3 in def[item][i2]){
            if(getType(def[item][i3]).match(/object/)){
              tg[item][i2][i3] = {};
            }else
            if(getType(def[item][i2][i3]).match(/string|number|symbol|array|boolean/)){
              sav[item][i2] ? (sav[item][i2][i3] === undefined ? tg[item][i2][i3] = def[item][i2][i3] : tg[item][i2][i3] = sav[item][i2][i3]) : tg[item][i2][i3] = def[item][i2][i3];
            }
          }
        }else
        if(getType(def[item][i2]).match(/string|number|symbol|array|boolean/)){
          sav[item] ? (sav[item][i2] === undefined ? tg[item][i2] = def[item][i2] : tg[item][i2] = sav[item][i2]) : tg[item][i2] = def[item][i2];
        }
      }
    }else
    if(getType(def[item]).match(/string/)){
      sav[item] === undefined ? tg[item] = def[item] : tg[item] = sav[item];
    }
  }
  console.log(`[Settings merge] Настройки успешно совмещены`);
  new Alert({
    type: 'Settings merge',
    text: 'Настройки успешно обновлены!',
    timer: 1000
  })
  return tg;
};

  // ==UserScript==
  // @name        DTF feeds
  // @namespace   Violentmonkey Scripts
  // @match       https://dtf.ru/*
  // @grant       none
  // @version     1.0
  // @author      -
  // @description Скрипт для улучшения обращения с фидами
  // ==/UserScript==



  new Css('dtf-feedGroup',
`
:is(.dtf-feedGroups, .dtf-feedGroups.obs) {
  display: flex;
  flex-direction: column;
  gap: 3px 0px;
  margin-bottom: 10px;
  border-radius: 3px;
}

.dtf-feedGrous:not(.obs) {
  box-shadow: 0px 0px 2px 0px rgb(0 0 0);
}

.dtf-feedGroups.obs .feed__item {
  position: relative;
  box-shadow: 0px 0px 2px 0px rgb(0 0 0);
}

.dtf-feedGroups .dtf-feed-group {
  margin: 0px 3px 0px 3px;
  padding: 3px;
  overflow-y: auto;
  max-height: 730px;
  box-shadow: 0px 0px 3px 1px black;
}

.dtf-feedGroups .groupList {
  padding: 0px 5px 0px 0px;
}

.dtf-feedGroups .dtf-feed-group .subGroup {
  background-color: rgb(0 0 0);
  border-radius: 3px;
  box-shadow: 0px 0px 2px 0px rgb(0 0 0);
}

.dtf-feedGroups .panel {
  margin: 3px;
}

.dtf-feedGroups .subList {
  display: flex;
  gap: 10px 0px;
  background-color: rgb(255 255 255);
  margin: 5px;
  padding: 5px;
  max-height: 500px;
  overflow-y: auto;
  flex-direction: column;
  overscroll-behavior: contain;
}


.dtf-feedGroups {
  width: 700px;
  margin: 0px 0px 0px -25px;
}
.dtf-feedGroups.obs {
  row-gap: 15px;
}
.dtf-feedGroups .dtf-feed-group :is(.groupHeader, .panel) {
  width: 100%;
  color: white;
  padding: 3px;
  font-size: 14px;
  cursor: pointer;
}
.dtf-feed-group .groupHeader {
    background-color: rgb(58 21 78);
    border-radius: 3px;
}
.dtf-feed-group .groupHeader :is(.title, .num, newMark) {
  display: inline-block;
}
.dtf-feed-group .groupHeader .title {
  font-weight: 600;
  color: rgb(101 215 168);
}
.dtf-feed-group .groupHeader .num {
  background-color: rgb(0 0 0);
  color: rgb(255 255 255);
  box-shadow: 0px 0px 4px 1px rgb(101 215 168);
}
.dtf-feed-group .groupHeader .num.off {
  display: none;
}
.dtf-feed-group .panel .mask {
  width: 14px;
  height: 14px;
  margin: 0px 5px 0px 0px;
  background-color: rgb(255 255 255);
  border-radius: 50%;
  display: inline-flex;
  overflow: hidden;
  box-shadow: 0px 0px 3px 0px rgb(0 0 0);
}
.dtf-feed-group .panel .ico {
  margin: auto;
  max-width: 14px;
  max-height: 14px;
}
.dtf-feed-group .panel :is(.title, .num, .newMark) {
  display: inline-block;
  overflow: hidden;
  margin: 0px 5px -1px 0px;
}

.dtf-feed-group .panel .title {
  max-width: 350px;
}
.dtf-feed-group .num {
  margin-left: 5px;
  color: rgb(255 255 255);
  background-color: rgb(0 0 0);
  padding: 1px 3.5px 0px 3.5px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  box-shadow: 0px 0px 4px 1px rgb(255 255 255);
}

:is(.dtf-feed-group, .dtf-feed-group .subList)::-webkit-scrollbar {
  width: 9px;
  background: rgb(0 0 0);
}
:is(.dtf-feed-group, .dtf-feed-group .subList)::-webkit-scrollbar-track {
  background: rgb(0 0 0 / 67%);
}
:is(.dtf-feed-group, .dtf-feed-group .subList)::-webkit-scrollbar-track-piece {
  background-color: unset;
  border: 3px solid rgba(155, 105, 105, 0);
  border-radius: 0px;
  width: 1px;
  height: 1px;
}
:is(.dtf-feed-group, .dtf-feed-group .subList)::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 18px;
  box-shadow: inset 0px 0px 0px 1px rgb(41 206 145 / 12%), inset 0px 0px 5px 1px rgb(255 255 255 / 70%), inset 0px 0px 0px 1px rgb(41 206 145 / 12%);
}
:is(.dtf-feed-group, .dtf-feed-group .subList)::-webkit-scrollbar-corner {
  background-color: unset;
}



.dtf-feed-group :is(.groupList.hidden, .subList.hidden) {
  display: none;
}

.dtf-feedGroups .subList .feed__item.l-island-round {
  position: relative;
  border-radius: unset;
  box-shadow: 0px 0px 3px 0px rgb(0 0 0);
}

.dtf-feedGroups .feed__item.l-island-round>div {
  margin-bottom: unset;
}
.dtf-feedGroups .l-island-round {
  border-radius: unset;
}

.dtf-feed-group .subGroup {
  position: relative;
  background-color: rgb(0 0 0);
}

.dtf-feed-group .panel .newMark {
  background-color: rgb(0 0 0);
  display: inline-block;
  max-width: max-content;
  color: rgb(203 203 203);
  font-size: 13px;
  padding: 0px 3px 0px 3px;
  border-radius: 3px;
  margin-left: 5px;
}
.dtf-feed-group .newMark.off {
  display: none;
}

.dtf-feed-group .sgActions {
  display: none;
  position: relative;
  float: right;
  margin: 1px 0px 0px 0px;
  z-index: 10;
}
.dtf-feed-group .panel:hover .sgActions {
  display: inline-block;
}

.dtf-feed-group .sgActions button {
  background-color: rgb(255 255 255);
  color: rgb(0 0 0);
  font-size: 11px;
  font-weight: 500;
  padding: 0px 3px 0px 3px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
  position: relative;
  box-shadow: 0px 0px 3px 0px rgb(0 0 0);
}

.dtf-feedGroups .feed__item .feed-actions {
  color: black;
  border-radius: 3px;
  padding: 1px;
  margin-right: 10px;
  display: flex;
  align-items: flex-start;
  gap: 0px 7px;
}
.dtf-feedGroups .feed__item .feed-actions button {
  color: rgb(0 0 0);
  padding: 0px 3px 0px 3px;
  cursor: pointer;
  box-shadow: 0px 0px 3px 1px rgb(110 109 109);
}
.dtf-feedGroups .feed__item .feed-actions button:hover {
  color: red;
}

.dtf-feedGroups .feed__item.l-island-round.collapsed {
  position: relative;
  box-shadow: 0px 0px 3px 1px rgb(0 0 0);
  border-radius: unset;
}
.dtf-feedGroups .feed__item.l-island-round.collapsed::after {
  display: block;
  width: 100%;
  position: absolute;
  color: rgb(108 108 108);
  font-size: 14px;
  font-weight: 600;
  top: 3px;
  text-align: center;
  filter: contrast(1);
  z-index: 0;
}

.dtf-feedGroups .feed__item.l-island-round:is(
.favoriteSubsite, .ignoredSubsite
)::before {
  display: block;
  width: max-content;
  position: absolute;
  color: rgb(108 108 108);
  font-size: 11px;
  font-weight: 600;
  top: 3px;
  left: 3px;
  text-align: left;
  z-index: 0;
}

.dtf-feedGroups .feed__item.l-island-round:is(
.favoriteAuthor, .ignoredAuthor
)::after {
  display: block;
  width: 100%;
  position: absolute;
  color: rgb(108 108 108);
  font-size: 11px;
  font-weight: 600;
  top: 3px;
  right: 3px;
  text-align: right;
  z-index: 0;
}

.dtf-feedGroups .feed__item.l-island-round:is(
.watchedFeed, .ignoredFeed
)>:nth-child(1)::after {
  display: block;
  width: 100%;
  position: absolute;
  color: rgb(108 108 108);
  font-size: 13px;
  font-weight: 600;
  top: 3px;
  text-align: center;
  z-index: 0;
}

.dtf-feed-group .subGroup:is(.favoriteSubsite, .favoriteAuthor)::after {
  display: block;
  position: absolute;
  top: 2px;
  right: 3px;
  color: rgb(108 108 108);
  font-size: 11px;
  font-weight: 600;
  z-index: 0;
}

.dtf-feedGroups .feed__item.l-island-round:is(.collapsed),
.feed__item.l-island-round:is(.collapsed)>div {
  min-height: 40px;
  max-height: 40px;
  overflow-y: hidden;
}


.dtf-feedGroups .feed__item.l-island-round.watchedFeed>:nth-child(1)::after {
  content: 'ФИД ПРОСМОТРЕН ✔️';
}
.dtf-feedGroups .feed__item.l-island-round.ignoredFeed>:nth-child(1)::after {
  content: 'ФИД ИГНОРИРУЕТСЯ 🚫';
}


.dtf-feed-group .subGroup:is(.favoriteSubsite, .favoriteAuthor) {
  background-color: rgb(144 209 172);
  box-shadow: 0px 0px 3px 1px rgb(50 50 50);
}
.dtf-feed-group .subGroup.favoriteAuthor .panel .title {
  color: rgb(0 0 0);
}
.dtf-feedGroups .feed__item.l-island-round.favoriteAuthor .content-header {
  background-color: rgb(209 144 205);
}
.dtf-feedGroups .feed__item.l-island-round.favoriteAuthor .favoriteAuthor.btn {
  background-color: rgb(243 160 208);
  font-weight: 500;
}
.dtf-feedGroups :is(.feed__item.l-island-round, .subGroup).favoriteAuthor::after {
  content: 'ИЗБРАННЫЙ АВТОР 💘';
}

.dtf-feedGroups .feed__item.l-island-round.ignoredAuthor>:nth-child(1) {
  filter: opacity(0.7);
}
.dtf-feedGroups .feed__item.l-island-round.ignoredAuthor .content-header {
  background-color: rgb(229 198 198);
}
.dtf-feedGroups .feed__item.l-island-round.ignoredAuthor .ignoreAuthor.btn {
  background-color: rgb(243 160 208);
  font-weight: 500;
}
.dtf-feedGroups .feed__item.l-island-round.ignoredAuthor::after {
  content: 'ИГНОРИРУЕМЫЙ АВТОР 🚫';
}


.dtf-feedGroups .subGroup.favoriteSubsite::after {
  content: 'ИЗБРАННЫЙ ПОДСАЙТ 💘';
}
.dtf-feed-group .subGroup.favoriteSubsite .panel .title {
  color: rgb(0 0 0);
}
.dtf-feedGroups .feed__item.l-island-round.favoriteSubsite .content-header {
  background-color: rgb(144 209 172);
}
.dtf-feedGroups .feed__item.l-island-round.favoriteSubsite .favoriteSubsite.btn {
  background-color: rgb(243 160 208);
  font-weight: 500;
}
.dtf-feedGroups .feed__item.l-island-round.favoriteSubsite::before {
  content: 'ИЗБРАННЫЙ ПОДСАЙТ 💘';
}



.dtf-feedGroups .feed__item.l-island-round.ignoredSubsite>:nth-child(1) {
  filter: opacity(0.7);
}
.dtf-feedGroups .feed__item.l-island-round.ignoredSubsite .content-header {
  background-color: rgb(215 148 171);
}
.dtf-feedGroups .feed__item.l-island-round.ignoredSubsite .ignoreSubsite.btn {
  background-color: rgb(243 160 208);
  font-weight: 500;
}
.dtf-feedGroups .feed__item.l-island-round.ignoredSubsite::before {
  content: 'ИГНОРИРУЕМЫЙ ПОДСАЙТ 🚫';
}


.dtf-feedGroups .feed__item.l-island-round.watchedFeed>:nth-child(1) {
  filter: opacity(0.7);
}
.dtf-feedGroups .feed__item.l-island-round.watchedFeed .content-header {
  background-color: rgb(199 229 215);
}
.dtf-feedGroups .feed__item.l-island-round.watchedFeed .watchFeed.btn {
  background-color: rgb(243 160 208);
  font-weight: 500;
}

.dtf-feedGroups .feed__item.l-island-round.ignoredFeed>:nth-child(1) {
  filter: opacity(0.7);
}
.dtf-feedGroups .feed__item.l-island-round.ignoredFeed .content-header {
  background-color: rgb(229 198 198);
}
.dtf-feedGroups .feed__item.l-island-round.ignoredFeed .ignoreFeed.btn {
  background-color: rgb(243 160 208);
  font-weight: 500;
}



.dtf-feed-group .subGroup.ignoredAuthor {
  background-color: rgb(78 28 52);
  box-shadow: 0px 0px 2px 0px rgb(0 0 0);
}
.dtf-feed-group .subGroup.ignoredAuthor .title {
  color: rgb(195 112 154);
}


.dtf-feedGroups .feed__item.l-island-round.blogBlockedByNoTitle::after {
  content: '⛔ Блог скрыт фильтром, нет заголовка ⛔';
}
.dtf-feedGroups .feed__item.l-island-round.blogBlockedByTitle::after {
  content: '⛔ Блог скрыт фильтром, запрещённый текст в заголовке ⛔';
}
.dtf-feedGroups .feed__item.l-island-round.subsiteBlockedByNoTitle::after {
  content: '⛔ Статья скрыта фильтром, нет заголовка ⛔';
}
.dtf-feedGroups .feed__item.l-island-round.subsiteBlockedByTitle::after {
  content: '⛔ Статья скрыта фильтром, запрещённый текст в заголовке ⛔';
}

.dtf-feedGroups .feed__item.l-island-round.blogBlockedByNoText::after {
  content: '⛔ Блог скрыт фильтром, нет текста ⛔';
}
.dtf-feedGroups .feed__item.l-island-round.blogBlockedByText::after {
  content: '⛔ Блог скрыт фильтром, запрещённый текст ⛔';
}
.dtf-feedGroups .feed__item.l-island-round.subsiteBlockedByNoText::after {
  content: '⛔ Статья скрыта фильтром, нет текста ⛔';
}
.dtf-feedGroups .feed__item.l-island-round.subsiteBlockedByText::after {
  content: '⛔ Статья скрыта фильтром, запрещённый текст ⛔';
}

.layout__right-column>:nth-child(1)>:nth-child(1)>:nth-child(2)>:nth-child(1)>:nth-child(2) .commentBlockedByLink {
  background-color: rgb(0 0 0);
}

.dtf-feedGroups .dtf-menuButton {
  background-color: rgb(211 224 231);
  color: rgb(0 0 0);
  padding: 0px 3px 0px 3px;
  cursor: pointer;
  box-shadow: 0px 0px 3px 1px rgb(110 109 109);
}
.dtf-feedGroups .dtf-menuButton .menuList {
  /*margin: 0px 0px 0px -3px;*/
  margin: 0px 0px 0px 19px;
}






:is(.DTF-video, .DTF-videoYT) {
  display: flex;
  max-width: 600px;
  max-height: 400px;
  margin: auto;
}
:not(.comment) :is(.DTF-video, .DTF-videoYT) :is(video, iframe) {
  max-width: 600px;
  position: relative;
  margin: auto;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.dtf-feedGroups .v-subscribe-button__subscribe {
  background-color: unset;
}
`);

  let initCfg = {
    storeName: 'DTF feeds',
    storeDesc: 'Настройки скрипта DTF feeds',
    name: 'DTF feeds',
    id: 'feeds',
    params: (form) => {
      this.workMode = new Field({
        path: form,
        groupName: 'working mode',
        legend: `Панель фидов`,
        inputs: [
          {
            type: 'radio',
            name: 'type',
            checked: mainSettings['working mode']['type'] === 'panel' ? true : '',
            text: 'Панель фидов',
            value: 'panel'
          },
          {
            type: 'radio',
            name: 'type',
            checked: mainSettings['working mode']['type'] === 'obs' ? true : '',
            text: 'Обсервер фидов',
            value: 'obs'
          },
          {
            type: 'radio',
            name: 'type',
            checked: mainSettings['working mode']['type'] === 'panel and obs' ? true : '',
            text: 'Панель и обсервер фидов',
            value: 'mid'
          }
        ]
      });
      // this.obs = new Field({
      //   path: form,
      //   groupName: 'observers',
      //   legend: `Обсерверы`,
      //   style: `display: grid;
      //   grid-template-columns: repeat(1, max-content);
      //   width: 100%;`,
      //   inputs: [
      //     {
      //       type: 'checkbox',
      //       name: 'activate feeds observer',
      //       checked: mainSettings['observers']['activate feeds observer'],
      //       text: 'Активировать обсервер фидов'
      //     }
      //   ]
      // });
      this.whereReact = new Field({
        path: form,
        groupName: 'where to react',
        legend: `Где срабатывать`,
        inputs: [
          {
            type: 'checkbox',
            name: 'popular',
            checked: mainSettings['where to react']['popular'],
            text: 'Популярное'
          },
          {
            type: 'radio',
            name: 'popular types',
            checked: mainSettings['where to react']['popular types'] === 'blogs',
            text: 'Показывать блоги',
            value: 'blogs'
          },
          {
            type: 'radio',
            name: 'popular types',
            checked: mainSettings['where to react']['popular types'] === 'subsites',
            text: 'Показывать подсайты',
            value: 'subsites'
          },
          {
            type: 'radio',
            name: 'popular types',
            checked: mainSettings['where to react']['popular types'] === 'blogs and subsites',
            text: 'Показывать блоги и подсайты',
            value: 'blogs and subsites'
          },

          {
            type: 'checkbox',
            name: 'new',
            checked: mainSettings['where to react']['new'],
            text: 'Свежее'
          },
          {
            type: 'radio',
            name: 'new types',
            checked: mainSettings['where to react']['new types'] === 'blogs',
            text: 'Показывать блоги',
            value: 'blogs'
          },
          {
            type: 'radio',
            name: 'new types',
            checked: mainSettings['where to react']['new types'] === 'subsites',
            text: 'Показывать подсайты',
            value: 'subsites'
          },
          {
            type: 'radio',
            name: 'new types',
            checked: mainSettings['where to react']['new types'] === 'blogs and subsites',
            text: 'Показывать блоги и подсайты',
            value: 'blogs and subsites'
          },

          {
            type: 'checkbox',
            name: 'my new',
            checked: mainSettings['where to react']['my new'],
            text: 'Моя лента'
          },
          {
            type: 'radio',
            name: 'my new types',
            checked: mainSettings['where to react']['my new types'] === 'blogs',
            text: 'Показывать блоги',
            value: 'blogs'
          },
          {
            type: 'radio',
            name: 'my new types',
            checked: mainSettings['where to react']['my new types'] === 'subsites',
            text: 'Показывать подсайты',
            value: 'subsites'
          },
          {
            type: 'radio',
            name: 'my new types',
            checked: mainSettings['where to react']['my new types'] === 'blogs and subsites',
            text: 'Показывать блоги и подсайты',
            value: 'blogs and subsites'
          },

          {
            type: 'checkbox',
            name: 'subsites',
            checked: mainSettings['where to react']['subsites'],
            text: 'Подсайты'
          },
          {
            type: 'radio',
            name: 'subsites types',
            checked: mainSettings['where to react']['subsites types'] === 'blogs',
            text: 'Показывать блоги',
            value: 'blogs'
          },
          {
            type: 'radio',
            name: 'subsites types',
            checked: mainSettings['where to react']['subsites types'] === 'subsites',
            text: 'Показывать подсайты',
            value: 'subsites'
          },
          {
            type: 'radio',
            name: 'subsites types',
            checked: mainSettings['where to react']['subsites types'] === 'blogs and subsites',
            text: 'Показывать блоги и подсайты',
            value: 'blogs and subsites'
          },

          {
            type: 'checkbox',
            name: 'user pages',
            checked: mainSettings['where to react']['user pages'],
            text: 'Страницы пользователей'
          },
          {
            type: 'radio',
            name: 'user pages types',
            checked: mainSettings['where to react']['user pages types'] === 'blogs',
            text: 'Показывать блоги',
            value: 'blogs'
          },
          {
            type: 'radio',
            name: 'user pages types',
            checked: mainSettings['where to react']['user pages types'] === 'subsites',
            text: 'Показывать подсайты',
            value: 'subsites'
          },
          {
            type: 'radio',
            name: 'user pages types',
            checked: mainSettings['where to react']['user pages types'] === 'blogs and subsites',
            text: 'Показывать блоги и подсайты',
            value: 'blogs and subsites'
          },

          {
            type: 'checkbox',
            name: 'topics',
            checked: mainSettings['where to react']['topics'],
            text: 'Статьи'
          },
          {
            type: 'radio',
            name: 'topics types',
            checked: mainSettings['where to react']['topics types'] === 'blogs',
            text: 'Показывать блоги',
            value: 'blogs'
          },
          {
            type: 'radio',
            name: 'topics types',
            checked: mainSettings['where to react']['topics types'] === 'subsites',
            text: 'Показывать подсайты',
            value: 'subsites'
          },
          {
            type: 'radio',
            name: 'topics types',
            checked: mainSettings['where to react']['topics types'] === 'blogs and subsites',
            text: 'Показывать блоги и подсайты',
            value: 'blogs and subsites'
          },
        ]
      });
      this.whatToGroup = new Field({
        path: form,
        groupName: 'ignored authors',
        legend: `Что делать с игнорированными пользователями`,
        inputs: [
          {
            type: 'radio',
            name: 'what to do with ignored authors',
            checked: mainSettings['ignored authors']['what to do with ignored authors'] === 'collapse',
            text: 'Сворачивать блоги и статьи',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'what to do with ignored authors',
            checked: mainSettings['ignored authors']['what to do with ignored authors'] === 'delete',
            text: 'Удалять блоги и статьи',
            value: 'delete'
          }
        ]
      });
      this.whatToGroup = new Field({
        path: form,
        groupName: 'watched feeds',
        legend: `Что делать с просмотренными фидами`,
        inputs: [
          {
            type: 'radio',
            name: 'what to do with watched feeds',
            checked: mainSettings['watched feeds']['what to do with watched feeds'] === 'collapse',
            text: 'Сворачивать блоги и статьи',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'what to do with watched feeds',
            checked: mainSettings['watched feeds']['what to do with watched feeds'] === 'delete',
            text: 'Удалять блоги и статьи',
            value: 'delete'
          }
        ]
      });
      this.whatToGroup = new Field({
        path: form,
        groupName: 'ignored feeds',
        legend: `Что делать с игнорированными фидами`,
        inputs: [
          {
            type: 'radio',
            name: 'what to do with ignored feeds',
            checked: mainSettings['ignored feeds']['what to do with ignored feeds'] === 'collapse',
            text: 'Сворачивать блоги и статьи',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'what to do with ignored feeds',
            checked: mainSettings['ignored feeds']['what to do with ignored feeds'] === 'delete',
            text: 'Удалять блоги и статьи',
            value: 'delete'
          }
        ]
      });
      this.whatToGroup = new Field({
        path: form,
        groupName: 'ignored subsites',
        legend: `Что делать с игнорированными подсайтами`,
        inputs: [
          {
            type: 'radio',
            name: 'what to do with ignored subsites',
            checked: mainSettings['ignored subsites']['what to do with ignored subsites'] === 'collapse',
            text: 'Сворачивать статьи',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'what to do with ignored authors',
            checked: mainSettings['ignored subsites']['what to do with ignored subsites'] === 'delete',
            text: 'Удалять',
            value: 'delete'
          }
        ]
      });
      this.whatToGroup = new Field({
        path: form,
        groupName: 'what to group',
        legend: `Что группировать`,
        inputs: [
          {
            type: 'checkbox',
            name: 'subsites',
            checked: mainSettings['what to group']['subsites'],
            text: 'Группировать подсайты'
          },
          {
            type: 'checkbox',
            name: 'blogs',
            checked: mainSettings['what to group']['blogs'],
            text: 'Группировать блоги'
          }
        ]
      });
      this.feedsBlogsTitleFilter = new Field({
        path: form,
        groupName: 'feeds blogs title filter',
        legend: 'Фильтрация фидов по заголовку (блоги)',
        style: `display: inline-flex;
        width: 100%;
        flex-wrap: wrap;
        flex-direction: column;`,
        inputs: [
          {
            type: 'checkbox',
            name: 'filter enabled',
            checked: mainSettings['feeds blogs title filter']['filter enabled'],
            text: 'Фильтр фидов по заголовку включён'
          },
          {
            type: 'checkbox',
            name: 'block without title',
            checked: mainSettings['feeds blogs title filter']['block without title'],
            text: 'Блокировать фиды без заголовков'
          },
          {
            type: 'checkbox',
            name: 'block with some text',
            checked: mainSettings['feeds blogs title filter']['block with some text'],
            text: 'Блокировать фиды с определённым текстом в заголовках'
          },
          {
            type: 'radio',
            name: 'how to block blogs title',
            checked: mainSettings['feeds blogs title filter']['how to block blogs title'] === 'collapse',
            text: 'Прятать заблокировааные фиды',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'how to block blogs title',
            checked: mainSettings['feeds blogs title filter']['how to block blogs title'] === 'delete',
            text: 'Удалять заблокированные фиды',
            value: 'delete'
          }
        ]
      });
      new Ul({
        path: this.feedsBlogsTitleFilter,
        cName: 'itemsList view fullHor',
        name: 'words',
        valueName: 'string',
        text: 'Regex фильтр',
        editable: true,
        buttons: (q) => {
          new Button({
            path: q,
            text: '❌',
            onclick: () => {
              if(q.parentNode.parentNode.children.length > 1) q.parentNode.remove();
              else{
                q.parentNode.children[0].textContent = '';
                q.parentNode.removeAttribute('string');
              }
            }
          })
        },
        onblur: (e) => {
          e.target.parentNode.setAttribute('string', e.target.textContent);
        },
        target: mainSettings['feeds blogs title filter']['words'],
        onkeydown: (e) => {
          if(e.key === 'Enter'){
            e.preventDefault();
            this.li = new Li({
              path: e.target.parentNode.parentNode,
              editable: true,
              valueName: 'string',
              onblur: (e) => {
                e.target.parentNode.setAttribute('string', e.target.textContent);
              },
              buttons: (e) => {
                new Button({
                  path: e,
                  text: '❌',
                  onclick: () => {
                    if(e.parentNode.parentNode.children.length > 1) e.parentNode.remove();
                    else{
                      e.parentNode.children[0].textContent = '';
                      e.parentNode.removeAttribute('string');
                    }
                  }
                });
              }
            });
            this.range = document.createRange();
            this.sel = window.getSelection();

            this.range.setStart(this.li.children[0], 0);
            this.range.collapse(true);

            this.sel.removeAllRanges();
            this.sel.addRange(this.range);
          }
        }
      });
      this.feedsBlogsTextFilter = new Field({
        path: form,
        groupName: 'feeds blogs text filter',
        legend: 'Фильтрация фидов по тексту (блоги)',
        style: `display: inline-flex;
        width: 100%;
        flex-wrap: wrap;
        flex-direction: column;`,
        inputs: [
          {
            type: 'checkbox',
            name: 'filter enabled',
            checked: mainSettings['feeds blogs text filter']['filter enabled'],
            text: 'Фильтр фидов по тексту включён'
          },
          {
            type: 'checkbox',
            name: 'block without title',
            checked: mainSettings['feeds blogs text filter']['block without text'],
            text: 'Блокировать фиды без текста'
          },
          {
            type: 'checkbox',
            name: 'block with some text',
            checked: mainSettings['feeds blogs text filter']['block with some text'],
            text: 'Блокировать фиды с определённым текстом'
          },
          {
            type: 'radio',
            name: 'how to block blogs text',
            checked: mainSettings['feeds blogs text filter']['how to block blogs text'] === 'collapse',
            text: 'Прятать заблокированные фиды',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'how to block blogs text',
            checked: mainSettings['feeds blogs text filter']['how to block blogs text'] === 'delete',
            text: 'Удалять заблокированные фиды',
            value: 'delete'
          }
        ]
      });
      new Ul({
        path: this.feedsBlogsTextFilter,
        cName: 'itemsList view fullHor',
        name: 'words',
        valueName: 'string',
        text: 'Regex фильтр',
        editable: true,
        buttons: (q) => {
          new Button({
            path: q,
            text: '❌',
            onclick: () => {
              if(q.parentNode.parentNode.children.length > 1) q.parentNode.remove();
              else{
                q.parentNode.children[0].textContent = '';
                q.parentNode.removeAttribute('string');
              }
            }
          })
        },
        onblur: (e) => {
          e.target.parentNode.setAttribute('string', e.target.textContent);
        },
        target: mainSettings['feeds blogs text filter']['words'],
        onkeydown: (e) => {
          if(e.key === 'Enter'){
            e.preventDefault();
            this.li = new Li({
              path: e.target.parentNode.parentNode,
              editable: true,
              valueName: 'string',
              onblur: (e) => {
                e.target.parentNode.setAttribute('string', e.target.textContent);
              },
              buttons: (e) => {
                new Button({
                  path: e,
                  text: '❌',
                  onclick: () => {
                    if(e.parentNode.parentNode.children.length > 1) e.parentNode.remove();
                    else{
                      e.parentNode.children[0].textContent = '';
                      e.parentNode.removeAttribute('string');
                    }
                  }
                });
              }
            });
            this.range = document.createRange();
            this.sel = window.getSelection();

            this.range.setStart(this.li.children[0], 0);
            this.range.collapse(true);

            this.sel.removeAllRanges();
            this.sel.addRange(this.range);
          }
        }
      });
      this.feedsSubsitesTitleFilter = new Field({
        path: form,
        groupName: 'feeds subsites title filter',
        legend: 'Фильтрация фидов по заголовку (подсайты)',
        inputs: [
          {
            type: 'checkbox',
            name: 'filter enabled',
            checked: mainSettings['feeds subsites title filter']['filter enabled'],
            text: 'Фильтр фидов по заголовку включён'
          },
          {
            type: 'checkbox',
            name: 'block without title',
            checked: mainSettings['feeds subsites title filter']['block without title'],
            text: 'Блокировать фиды без заголовков'
          },
          {
            type: 'checkbox',
            name: 'block with some text',
            checked: mainSettings['feeds subsites title filter']['block with some text'],
            text: 'Блокировать фиды с определённым текстом в заголовках'
          },
          {
            type: 'radio',
            name: 'how to block subsites title',
            checked: mainSettings['feeds subsites title filter']['how to block subsites title'] === 'collapse',
            text: 'Прятать заблокированные фиды',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'how to block subsites title',
            checked: mainSettings['feeds subsites title filter']['how to block subsites title'] === 'delete',
            text: 'Удалять заблокированные фиды',
            value: 'delete'
          }
        ]
      });
      new Ul({
        path: this.feedsSubsitesTitleFilter,
        cName: 'itemsList view fullHor',
        name: 'words',
        valueName: 'string',
        text: 'Regex фильтр',
        editable: true,
        buttons: (q) => {
          new Button({
            path: q,
            text: '❌',
            onclick: () => {
              if(q.parentNode.parentNode.children.length > 1) q.parentNode.remove();
              else{
                q.parentNode.children[0].textContent = '';
                q.parentNode.removeAttribute('string');
              }
            }
          })
        },
        onblur: (e) => {
          e.target.parentNode.setAttribute('string', e.target.textContent);
        },
        target: mainSettings['feeds subsites title filter']['words'],
        onkeydown: (e) => {
          if(e.key === 'Enter'){
            e.preventDefault();
            this.li = new Li({
              path: e.target.parentNode.parentNode,
              editable: true,
              valueName: 'string',
              onblur: (e) => {
                e.target.parentNode.setAttribute('string', e.target.textContent);
              },
              buttons: (e) => {
                new Button({
                  path: e,
                  text: '❌',
                  onclick: () => {
                    if(e.parentNode.parentNode.children.length > 1) e.parentNode.remove();
                    else{
                      e.parentNode.children[0].textContent = '';
                      e.parentNode.removeAttribute('string');
                    }
                  }
                });
              }
            });
            this.range = document.createRange();
            this.sel = window.getSelection();

            this.range.setStart(this.li.children[0], 0);
            this.range.collapse(true);

            this.sel.removeAllRanges();
            this.sel.addRange(this.range);
          }
        }
      });
      this.feedsSubsitesTextFilter = new Field({
        path: form,
        groupName: 'feeds subsites text filter',
        legend: 'Фильтрация фидов по тексту (подсайты)',
        inputs: [
          {
            type: 'checkbox',
            name: 'filter enabled',
            checked: mainSettings['feeds subsites text filter']['filter enabled'],
            text: 'Фильтр фидов по тексту включён'
          },
          {
            type: 'checkbox',
            name: 'block without text',
            checked: mainSettings['feeds subsites text filter']['block without text'],
            text: 'Блокировать фиды без текста'
          },
          {
            type: 'checkbox',
            name: 'block with some text',
            checked: mainSettings['feeds subsites text filter']['block with some text'],
            text: 'Блокировать фиды с определённым текстом'
          },
          {
            type: 'radio',
            name: 'how to block subsites text',
            checked: mainSettings['feeds subsites text filter']['how to block subsites text'] === 'collapse',
            text: 'Прятать заблокированные фиды',
            value: 'collapse'
          },
          {
            type: 'radio',
            name: 'how to block subsites text',
            checked: mainSettings['feeds subsites text filter']['how to block subsites text'] === 'delete',
            text: 'Удалять заблокированные фиды',
            value: 'delete'
          }
        ]
      });
      new Ul({
        path: this.feedsSubsitesTextFilter,
        cName: 'itemsList view fullHor',
        name: 'words',
        valueName: 'string',
        text: 'Regex фильтр',
        editable: true,
        buttons: (q) => {
          new Button({
            path: q,
            text: '❌',
            onclick: () => {
              if(q.parentNode.parentNode.children.length > 1) q.parentNode.remove();
              else{
                q.parentNode.children[0].textContent = '';
                q.parentNode.removeAttribute('string');
              }
            }
          })
        },
        onblur: (e) => {
          e.target.parentNode.setAttribute('string', e.target.textContent);
        },
        target: mainSettings['feeds subsites text filter']['words'],
        onkeydown: (e) => {
          if(e.key === 'Enter'){
            e.preventDefault();
            this.li = new Li({
              path: e.target.parentNode.parentNode,
              editable: true,
              valueName: 'string',
              onblur: (e) => {
                e.target.parentNode.setAttribute('string', e.target.textContent);
              },
              buttons: (e) => {
                new Button({
                  path: e,
                  text: '❌',
                  onclick: () => {
                    if(e.parentNode.parentNode.children.length > 1) e.parentNode.remove();
                    else{
                      e.parentNode.children[0].textContent = '';
                      e.parentNode.removeAttribute('string');
                    }
                  }
                });
              }
            });
            this.range = document.createRange();
            this.sel = window.getSelection();

            this.range.setStart(this.li.children[0], 0);
            this.range.collapse(true);

            this.sel.removeAllRanges();
            this.sel.addRange(this.range);
          }
        }
      });
      this.commentsObs = new Field({
        path: form,
        groupName: 'obs comments',
        legend: `Обсервер комментариев боковой панели`,
        inputs: [
          {
            type: 'checkbox',
            name: 'is active',
            checked: mainSettings['obs comments']['is active'],
            text: 'Активировать обсервер'
          },
          {
            type: 'checkbox',
            name: 'block links',
            checked: mainSettings['obs comments']['block links'],
            text: 'Блокировать ссылки'
          },
          {
            type: 'checkbox',
            name: 'block text',
            checked: mainSettings['obs comments']['block text'],
            text: 'Блокировать текст'
          }
        ]
      });
      new Ul({
        path: this.commentsObs,
        cName: 'itemsList view fullHor',
        name: 'link words',
        valueName: 'string',
        text: 'Regex фильтр',
        editable: true,
        buttons: (q) => {
          new Button({
            path: q,
            text: '❌',
            onclick: () => {
              if(q.parentNode.parentNode.children.length > 1) q.parentNode.remove();
              else{
                q.parentNode.children[0].textContent = '';
                q.parentNode.removeAttribute('string');
              }
            }
          })
        },
        onblur: (e) => {
          e.target.parentNode.setAttribute('string', e.target.textContent);
        },
        target: mainSettings['obs comments']['link words'],
        onkeydown: (e) => {
          if(e.key === 'Enter'){
            e.preventDefault();
            this.li = new Li({
              path: e.target.parentNode.parentNode,
              editable: true,
              valueName: 'string',
              onblur: (e) => {
                e.target.parentNode.setAttribute('string', e.target.textContent);
              },
              buttons: (e) => {
                new Button({
                  path: e,
                  text: '❌',
                  onclick: () => {
                    if(e.parentNode.parentNode.children.length > 1) e.parentNode.remove();
                    else{
                      e.parentNode.children[0].textContent = '';
                      e.parentNode.removeAttribute('string');
                    }
                  }
                });
              }
            });
            this.range = document.createRange();
            this.sel = window.getSelection();

            this.range.setStart(this.li.children[0], 0);
            this.range.collapse(true);

            this.sel.removeAllRanges();
            this.sel.addRange(this.range);
          }
        }
      });
    },
    func: (cfg) => {
      if(!cfg){
        console.log(`First run`);
        if(mainSettings['where to react'][getPageType(document.location.href)]){
          console.log('[Activation]', getPageType(document.location.href));
          if(mainSettings['working mode']['type'].match(/panel$/)){
            new FeedGroups();
            feedsSearch();
          }else
          if(mainSettings['working mode']['type'].match(/obs$|panel and obs/)){
            new TwinGroup();
            feedsSearch();
            if(obs.feeds){
              obs.feeds.disconnect();
              obs.feeds.observe(document.querySelector(`div[class=feed] div[class=feed__container]`), {attributes: true, childList: true, subtree: true});
            }else{
              obsRun();
            }
          }
          if(mainSettings['obs comments']['is active']){
            if(obs.comments){
              obs.comments.disconnect();
              obs.feeds.observe(
                document.querySelector(`.layout__right-column>:nth-child(1)>:nth-child(1)>:nth-child(2)>:nth-child(1)>:nth-child(2)`),
                {attributes: false, childList: true, subtree: false}
              );
            }else{
              if(mainSettings['obs comments']['link words'].length > 0){
                try {
                  obs.commentsLinkFilter = new RegExp(mainSettings['obs comments']['link words'].join('|'), 'mi');
                } catch (err) {
                  new Alert({
                    alert: true,
                    type: 'RegExp фильтр боковой панели комментариев',
                    text: 'Ошибка фильтра! Вы ошиблись и ввели неверные слова/фразы/RegExp',
                    timer: 10000
                  })
                }
                // obs.commentsTextFilter = new RegExp(mainSettings['obs comments']['words'].join('|'), 'mi');
              }
              console.log('Comments obs link filter ', obs.commentsLinkFilter);
              obs.comments = observer({
                target: document.querySelector(`.layout__right-column>:nth-child(1)>:nth-child(1)>:nth-child(2)>:nth-child(1)>:nth-child(2)`),
                msg: '[OBS panel comments] фильтр активирован',
                mode: {attributes: false, childList: true, subtree: false},
                func: (item) => {
                  if(!item.nodeName.match(/DIV/)) return;
                  if(!item.querySelector(`a`)) return;
                  let arr = item.querySelectorAll(`a`);
                  if(mainSettings['obs comments']['is active']){
                    if(mainSettings['obs comments']['block links'] && arr[3] && obs.commentsLinkFilter){
                      // if(arr[3].children[0]) return;
                      // if(!arr[3].title) return;
                      // console.log(arr[3]);
                      // arr[3].textContent = 'Edited';
                      if(arr[3].textContent.trim().match(obs.commentsLinkFilter)){
                        // console.log('MATCH1');
                        arr[3].classList.add('commentBlockedByLink');
                        // arr[3].title = 'Edited';
                      }else
                      if(!arr[3].textContent.trim().match(obs.commentsLinksFilter)){
                        // console.log('MATCH2');
                        arr[3].classList.remove('commentBlockedByLink');
                      }
                    }
                    // if(mainSettings['obs comments']['block text'] && arr[2] && obs.commentsTextFilter){
                    //   if(arr[2].textContent.trim().match(obs.commentsTextFilter)) arr[2].textContent = '';
                    // }
                  }
                  // console.log(`${arr[3] ? ('LINK: '+arr[3].textContent.trim()) : ''}${arr[2] ? ('\nMSG: '+arr[2].textContent.trim()) : ''}`);
                }
              });
            }
          }
        }
        // if(document.location.href.match(filterBuilder())){
        //   if(mainSettings['working mode']['show panel']){
        //     new FeedGroups();
        //     feedsSearch();
        //   }else
        //   if(!mainSettings['working mode']['show panel'] || mainSettings['observers']['activate feeds observer']){
        //     new TwinGroup();
        //     feedsSearch();
        //     if(obs.feeds){
        //       obs.feeds.disconnect();
        //       obs.feeds.observe(document.querySelector(`div[class=feed] div[class=feed__container]`), {attributes: true, childList: true, subtree: true});
        //     }else{
        //       obsRun();
        //     }
        //   }
        // };
      }else
      if(cfg){
        // console.log(`Second run`);
        if(!cfg.firstRun){
          console.log(`Second run`);
        };
      }
    }
  };

  let db = dbGen(initCfg);
  function filterBuilder(){
    return new RegExp(`${document.location.href.origin}/${[
      mainSettings['where to react']['popular'] ? 'popular$' : '',
      mainSettings['where to react']['new'] ? 'new$' : '',
      mainSettings['where to react']['my feeds'] ? 'my/new$' : '',
      mainSettings['where to react']['subsites'] ? '' : '',
      mainSettings['where to react']['topics'] ? `[^/]+/[0-9]+-[^]+$` : ''
      ].filter(i => i).join('|')}`);
  }
  function obsRun(){
    obs.feeds = observer({
      target: document.querySelector(`div[class=feed] div[class=feed__container]`),
      check: true,
      search: /feed__container/,
      msg: '[OBS feeds] фильтр активирован',
      func: (item) => {
        // console.log('OBS ', item);
        if(!item.classList.value > 0) return;
        if(item.classList.value.match(/feed__chunk/)){
          feedsSearch();
          // for(let i = 0, arr = item.children; i < arr.length; i++){
          //   // console.log('OBS', arr[i].children[0].getAttribute('data-content-id'));
          //   new FeedActions(arr[i].querySelector(`div[class=content-header__info]`), arr[i]);
          //   if(mainSettings.data.watched.includes(arr[i].children[0].getAttribute('data-content-id').toString())){
          //     console.log('I see watched, desu!', arr[i].children[0].getAttribute('data-content-id'));
          //     arr[i].classList.add('watchedFeed');
          //   }
          //   if(mainSettings['working mode']['show panel']){
          //     if(mainSettings['what to group']['blogs']){
          //       new SubGroup(
          //         document.getElementById('dtf-feedGroups').children[2].children[1],
          //         arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[0].children[0].getAttribute('data-image-src'),
          //         arr[i].querySelector(`div[class=content-header__info]`).children[0].children[0].children[1].textContent, arr[i]
          //       );
          //     }else{
          //       document.getElementById('dtf-feedGroups').children[2].children[1].appendChild(arr[i]);
          //     }
          //   }else
          //   if(mainSettings['observers']['activate feeds observer']){
          //     document.getElementById('dtf-feedGroups').appendChild(arr[i]);
          //   }
          // }
        }
      }
    });
  }
  function getPageType(url){
    let filter = /https:\/\/dtf\.ru\/(u\/|s\/|new$|popular$|my\/new$|[^/]{2,})(\d*)-{0,1}([^]*)/gm;
    let o;
    url.replace(filter, (d, type, id, username) => {
      if(type.match(/u\//) && id && username){
        // console.log('User page');
        o = 'user pages';
      }else
      if(type.match(/s\//) && !id && username){
        // console.log('Official subsite');
        o = 'subsites';
      }
      if(type.match(/s\//) && id && username){
        // console.log('User subsite');
        o = 'subsites';
      }else
      if(type.match(/^new$/)){
        // console.log('New');
        o = 'new';
      }else
      if(type.match(/^popular$/)){
        // console.log('Popular');
        o = 'popular';
      }else
      if(type.match(/^my\/new$/)){
        // console.log('My feed');
        o = 'my new';
      }else
      if(!type.match(/u\/|s\//) && !id && !username){
        // console.log('DTF subsite');
        o = 'subsites';
      }
    })
    return o;
  }

  // Запуск функций при загрузке страниц DTF
  onPageLoad(() => {
    let filter;
    // if(!document.querySelector(`div[class^=content][class*=content--full]`)) return;
    if(!mainSettings){
      settingsLoader(db, initCfg);
    }else
    if(mainSettings){
      if(mainSettings['where to react'][getPageType(document.location.href)]){
      // if(document.location.href.match(filterBuilder())){
        if(mainSettings['working mode']['type'].match(/panel$/)){
          console.log(`[Mode] режим панели`);
          new FeedGroups();
          feedsSearch();
        }else
        if(mainSettings['working mode']['type'].match(/obs$|panel and obs/)){
          console.log(`[Mode] режим обсервера и/или панели`);
          new TwinGroup();
          feedsSearch();
          if(obs.feeds){
            obs.feeds.disconnect();
            obs.feeds.observe(document.querySelector(`div[class=feed] div[class=feed__container]`), {attributes: true, childList: true, subtree: true});
          }else{
            obsRun();
          }
        }
        if(mainSettings['obs comments']['is active']){
          if(obs.comments){
            obs.comments.disconnect();
            obs.feeds.observe(
              document.querySelector(`.layout__right-column>:nth-child(1)>:nth-child(1)>:nth-child(2)>:nth-child(1)>:nth-child(2)`),
              {attributes: false, childList: true, subtree: false}
            );
          }else{
            if(mainSettings['obs comments']['link words'].length > 0){
              obs.commentsLinkFilter = new RegExp(mainSettings['obs comments']['link words'].join('|'), 'mi');
            }
            console.log('Comments obs link filter ', obs.commentsLinkFilter);
            obs.comments = observer({
              target: document.querySelector(`.layout__right-column>:nth-child(1)>:nth-child(1)>:nth-child(2)>:nth-child(1)>:nth-child(2)`),
              msg: '[OBS panel comments] фильтр активирован',
              mode: {attributes: false, childList: true, subtree: false},
              func: (item) => {
                if(!item.nodeName.match(/DIV/)) return;
                if(!item.querySelector(`a`)) return;
                let arr = item.querySelectorAll(`a`);
                if(mainSettings['obs comments']['is active']){
                  if(mainSettings['obs comments']['block links'] && arr[3] && obs.commentsLinkFilter){
                    if(arr[3].textContent.trim().match(obs.commentsLinkFilter)){
                      arr[3].classList.add('commentBlockedByLink');
                    }else
                    if(!arr[3].textContent.trim().match(obs.commentsLinksFilter)){
                      arr[3].classList.remove('commentBlockedByLink');
                    }
                  }
                }
              }
            });
          }
        }
      }
    }
  });

})();
