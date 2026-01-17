//Основано на: https://github.com/markdown-it/markdown-it-sub/blob/master/index.js
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitMentions = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  'use strict';

  function mention(state, silent) {
    var found,
        content,
        token,
        max = state.posMax,
        start = state.pos;
  
    if (state.src.charCodeAt(start) !== 60/* < */) { return false; }
    if (state.src.charCodeAt(start+1) !== 64/* @ */) { return false; }
    
    if (silent) { return false; } // don't run any pairs in validation mode
    if (start + 2 >= max) { return false; }
  
    state.pos = start + 1;
  
    while (state.pos < max) {
      if (state.src.charCodeAt(state.pos) === 62/* > */) {
        found = true;
        break;
      }
  
      state.md.inline.skipToken(state);
    }
  
    if (!found || start + 1 === state.pos) {
      state.pos = start;
      return false;
    }
  
    content = state.src.slice(start + 2, state.pos);
  
    // don't allow unescaped spaces/newlines inside
    if (!content.match(/^\d+$/)) {
      state.pos = start;
      return false;
    }
  
    // found!
    state.posMax = state.pos;
    state.pos = start + 1;

    // Проверяем пользователя
    let md_user = false;
    if(content == user.id) {
      	md_user = user;
    } else {
		md_user = dbr_users[content] && dbr_users[content].user || dbr_users[content]
	}
    if(!md_user) {
      state.pos = start;
      return false
    }


    // Делаем для него пинок
    token         = state.push('mention_open', 'a', 1);
    token.attrs   = [["rel", "noopener noreferrer"], ["target", "_blank"], ["href", `/id${md_user.id}`], ["class", "badge"], ["style", `color: ${md_user.dark ? "#000" : "#fff"}; background-color: ${md_user.color};`]];
    token.markup  = '<@';

    token         = state.push('mention_avatar', 'img', 0);
    token.attrs   = [["src", md_user.avatar], ["class", "img-ava"]]

    token         = state.push('text', '', 0);
    token.content = ` ${md_user.name}`;

    token         = state.push('mention_close', 'a', -1);
    token.markup  = '>';

  
    state.pos = state.posMax + 1;
    state.posMax = max;
    return true;
  }
  
  
  module.exports = function mentions_plugin(md) {
    md.inline.ruler.after('emphasis', 'mention', mention);
  };

},{}]},{},[1])(1)
});