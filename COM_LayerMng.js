// AUTHOR       : 유경수
// CREATE DATE  : 2017-03-23
// DESCRIPTION  : 재사용 가능한 컨펌 레이어 
// HISTORY      : 
// 2017-03-24 유경수 - 레이어를 한화면에 여러개 띄울 감안하고 재 작성

// ###################################### 
// 사용법 
// ###################################### 
// 1. HTML 
//  1) div / span 등 임의의 타입으로 html element를 원하는 
//     위치에 작성 후 id 값을 줌 (target으로 사용됨)
// 2. js
//  1) window['__LayerMng'].init(name , opt, callback) 함수로 레이어를 
//     초기화 (option 명세 참고)
//  2) window['__LayerMng'].show(name) 함수로 레이어 출력

// ######################################
// 함수 명세 
// ######################################
// window['__LayerMng']
// .init(name , opt, callback)  : 레이어를 초기화 callback에 함수를 넘겨 초기화 후 함수 실행
// .show(name)                  : 레이어를 출력
// .hide(name)                  : 레이어를 숨김 처리 
// .getObj(name)                : 해당 레이어의 객체를 가져옴
// .getDOM(name)                : 해당 레이어의 DOM 요소를 가져옴  

// ######################################
// option 명세 (* 표기된 항목은 필수값)
// ######################################
// title          * : string    레이어 제목
// content        * : html      레이어 내용
// target         * : string    덮어씌울 HTML요소의 ID
// confirm_title    : string    확인 버튼 텍스트 
// cancel_title     : string    취소 버튼 텍스트
// onload           : function  init함수가 실행되고 난 뒤에 실행되는 함수 
// confirm        * : function  확인 버튼을 눌렀을때 실행되는 함수    
// cancel           : function  취소 버튼을 눌렀을때 실행되는 함수 
// show             : function  레이어 보이기 처리 후 실행되는 함수 
// hide             : function  레이어 숨김 처리 후 실행되는 함수 
// css              : object    레이어 가장 바깥 부분의 CSS

// ## 유의 사항 
// - document가 모두 로드되고 렌더된 이후에 추가 함수가 실행되므로 비동기 처리시 주의
// - html 파일의 url을 확인해줄 것 

// 실행 예제 
/* 
    # HTML 
    <div id='layer1'></div> 
    # JS 
    // 초기화
    window['__LayerMng'].init('layer1' , {
        title : '레이어1번',
        content : '테스트테스트 <br/> 테스트테스트<br/>테스트',
        target : 'layer1',
        confirm_title : '확인1',
        cancel_title : '취소1',
        onload : function(){ console.log("[layer1] loaded") },
        confirm : function(){ console.log('[layer1] confirmed'); },
        cancel : function(){ console.log('[layer1] denied') },
        show : function(){ console.log('[layer1] show') },
        hide : function(){ console.log('[layer1] hide') },
        css : {
            "width" : "394px",
            "height" : "350px",
            "border" : "3px solid #42b7f6",
            "top"  : '50%',
            'left' : '50%',
            'margin-top' : '-175px',
            'margin-left' : '-197px',
            'position' : 'fixed'
        }
    }, function(obj , ajax){
        // CALLBACK FUNC
        console.log('CALLBACK!!!');
        console.log(obj , ajax);
    });

    // 보여주기
    window['__LayerMng'].show('layer1');
*/

window['__LayerMng'] = {
    _url : './layer_layout.html',
    _layers : {},
    _util : {
        isNullOrEmpty : function(obj){
            return !obj || typeof(obj) != 'string' || obj == '';
        },
        isNotFunction : function(fn){
            return !fn || typeof(fn) != 'function';
        }
    },
    _mockup : { 
        _name : "",
        _ajax : {},
        _dom : {},
        _opt : {},
        _confirm : function(){ 
            if(window['__LayerMng']._util.isNotFunction(this._opt['confirm'])){
                throw '확인 버튼을 눌렀을때 실행될 함수가 없습니다'
            }
            this._opt['confirm']();
            this.hide();
        },
        _cancel : function(){ 
            if(!window['__LayerMng']._util.isNotFunction(this._opt['cancel'])){
                this._opt['cancel']();
            }
            this.hide();
        },
        _generate : function(){
            if(window['__LayerMng']._util.isNullOrEmpty(this._opt['target'])){ throw '대상 객체의 아이디가 없습니다' }
            if(window['__LayerMng']._util.isNullOrEmpty(this._opt['title'])){ throw '대상 객체의 아이디가 없습니다' }
            if(window['__LayerMng']._util.isNullOrEmpty(this._opt['content'])){ throw '레이어 내용이 공백입니다' }

            this._dom.hide();
            
            this._dom.find('[id*=_title]').text(this._opt.title);
            this._dom.find('[id*=_desc]').html(this._opt.content);

            if(!window['__LayerMng']._util.isNullOrEmpty(this._opt['confirm_title'])){
                this._dom.find('[id*=__LayerMng_confirm]').text(this._opt['confirm_title']);
            }
            if(!window['__LayerMng']._util.isNullOrEmpty(this._opt['cancel_title'])){
                this._dom.find('[id*=__LayerMng_cancel]').text(this._opt['cancel_title']);
            }

            if(this._opt.css){
                for(key in this._opt.css){ this._dom.css(key , this._opt.css[key]); }
            }

            // html요소들 id를 변경 
            this._dom.attr('id' ,  "__" + this._name)
            this._dom.find('[id*=_title]').attr('id' , '__' + this._name + '_title'); 
            this._dom.find('[id*=_desc]').attr('id' ,  '__' + this._name + 'desc') 
            this._dom.find('[id*=__LayerMng_confirm]')
                .attr('id' , '__' + this._name + '_cancel')
                .click(this._confirm.bind(this))
            this._dom.find('[id*=__LayerMng_cancel]')
                .attr('id' , '__' + this._name + '__LayerMn_confirm')
                .click(this._cancel.bind(this))
            
            // document가 준비된 다음에 실행될 수 있으므로 해당함수 실행시 
            // document ready 함수로 감싸야
            $("#" + this._opt.target).replaceWith(this._dom);
        },
        _init : function(opt){
            this._opt = opt;
            this._ajax = $.get({
                url : window['__LayerMng']._url,
                context : this
            })
            .done(function(dom){
                this._dom = $(dom);
                this._generate();

                if(!window['__LayerMng']._util.isNotFunction(this._opt['onload'])){
                    this._opt['onload']();
                }
            })
            .fail(function(){
                throw '레이아웃 html 파일의 위치를 확인해주세요 : [' + window['__LayerMng']._url + "]";
            });

            return this._ajax;
        },
        show : function(){ 
            if(this._dom.is(":visible")){ console.log('['+ this._name +'] 레이어는 이미 열려있습니다'); return; }
            if(!window['__LayerMng']._util.isNotFunction(this._opt['show'])){
                this._opt['show']();
            }
            
            this._dom.show(); 
        },
        hide : function(){ 
            if(!this._dom.is(":visible")){ console.log('['+ this._name +'] 레이어는 이미 닫혀있습니다'); return; }
            if(!window['__LayerMng']._util.isNotFunction(this._opt['hide'])){
                this._opt['hide']();
            }
            this._dom.hide(); 
        }
    },
    getObj : function(name){ return this._layers[name] },
    getDOM : function(name){ return this._layers[name]._dom },
    show : function(name) { 
        var __flag = true;
        for(key in this._layers){
            if(key != name && this.getDOM(key).is(':visible')){
                __flag = false;
                console.log('['+ key +'] 레이어가 이미 출력되어 있습니다. 먼저 닫아주세요.');
                break;
            }
        }
        if(__flag){ this._layers[name].show();  }
    },
    hide : function(name) { 
        // 이름이 없으면 열림 처리되어있는 모든 레이어를 닫아버림
        if(this._util.isNullOrEmpty(name)){ 
            for(key in this._layers){
                if(this.getDOM(key).is(':visible')){ this._layers[key].hide(); }
            }
        }
        else{
            this._layers[name].hide(); 
        }
        
    },
    init : function(name , opt , callback){
        if(this._util.isNullOrEmpty(opt['title'])){     throw '레이어 제목이 없습니다.' }
        if(this._util.isNullOrEmpty(opt['content'])){   throw '레이어 내용이 없습니다.'}
        if(this._util.isNullOrEmpty(opt['target'])){    throw '레이어 생성 대상이 없습니다.' }
        //if(!opt['confirm']){ throw '확인 버튼 관련 객체가 없습니다.' }
        //if(this._util.isNotFunction(opt['confirm']['func'])){ throw '확인 버튼 클릭시 실행될 함수가 없습니다.' }
        if(this._util.isNotFunction(opt['confirm'])){   throw '확인 버튼 클릭시 실행될 함수가 없습니다.' }
        
        if(this._util.isNullOrEmpty(name)){ throw '레이어 이름이 없습니다.' }

        // 내용을 참조하지 않고 복사함
        this._layers[name] = jQuery.extend({} , window['__LayerMng']._mockup);
        this._layers[name]._name = name;
        $(document).ready(function(){
            window['__LayerMng']._layers[name]._init(opt)
            .then(function(){
                if(callback && !window['__LayerMng']._util.isNotFunction(callback)){
                    callback(this , this._ajax);
                }
            });
            
        });
    }
}

