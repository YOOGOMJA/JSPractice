(function(){
    // AUTHOR       : 유경수
    // CREATE DATE  : 2017-03-23
    // DESCRIPTION  : 재사용 가능한 컨펌 레이어 
    // HISTORY      : 
    
    // ## 사용법 
    // 1. 레이어 로드하기 
    // window['__LayerMng'].init(opt);
    // 2. 레이어 보이기 / 숨기기
    // window['__LayerMng'].show();
    // window['__LayerMng'].hide();
    
    // ## option 명세 (* 표시 된것들은 필수 값)
    // title          * : string    레이어 제목
    // content        * : html      레이어 내용
    // target         * : string    덮어씌울 HTML요소의 ID
    // confirm_title    : string    확인 버튼 텍스트 
    // cancel_title     : string    취소 버튼 텍스트
    // onload           : function  init함수가 실행되고 난 뒤에 실행되는 함수 
    // confirm        * : function  확인 버튼을 눌렀을때 실행되는 함수    
    // cancel           : function  취소 버튼을 눌렀을때 실행되는 함수 
    // onshow           : function  레이어 보이기 처리 후 실행되는 함수 
    // onhide           : function  레이어 숨김 처리 후 실행되는 함수 
    // css              : object    레이어 가장 바깥 부분의 CSS
    
    window['__LayerMng'] = {
        _url : './layer_layout.html',
        _ajax : {},
        _dom : {},
        _opt : {},
        _generate : function()
        {
            // 옵션대로 html을 조작하자
            // 글 내용 및 css
            if(!this._opt.target || this._opt.target == ''){ throw '대상 객체의 아이디가 없습니다' }
            if(!this._opt.title || this._opt.title == ''){ throw '레이어 제목이 공백입니다.' }
            if(!this._opt.content || this._opt.content == ''){ throw '레이어 내용이 공백입니다.' }

            this._dom.hide();
            this._dom.find('[id*=_title]').html(this._opt.title);
            this._dom.find('[id*=_desc]').html(this._opt.content);

            if(this._opt.confirm_title && this._opt.confirm_title != '')
            {  
                this._dom.find('[id=__LayerMng_confirm]').text(this._opt.confirm_title);
            }
            if(this._opt.cancel_title && this._opt.cancel_title != '')
            {
                this._dom.find('[id=__LayerMng_cancel]').text(this._opt.cancel_title);
            }
            if(this._opt.css){
                for(key in this._opt.css){
                    this._dom.css(key , this._opt.css[key])
                }
            }
            
            this._dom.find('[id=__LayerMng_confirm]').click(window['__LayerMng']._confirm);
            this._dom.find('[id=__LayerMng_cancel]').click(window['__LayerMng']._cancel);

            // 넘겨받은 ID의 객체와 현재 객체를 바꿔친다
            $('#' + this._opt.target).replaceWith(this._dom);
        },
        _confirm : function()
        {
            // 컨펌시 실행되는 함수
            if(!window['__LayerMng']._opt.confirm || typeof(window['__LayerMng']._opt.confirm) != 'function')
            { 
                throw '승인시 실행될 함수가 없습니다.';
            }

            $.when(window['__LayerMng']._opt.confirm()).then(window['__LayerMng'].hide())
            // 기본 숨김처리 
            
        },
        _cancel : function()
        {
            // 취소 시 실행되는 함수 , 들어있을 경우에만 실행하도록 한다.
            if(window['__LayerMng']._opt.cancel && typeof(window['__LayerMng']._opt.cancel) == 'function')
            {
                $.when(window['__LayerMng']._opt.cancel()).then(window['__LayerMng'].hide());
            }
            else
            {
                // 기본 숨김처리 
                 window['__LayerMng'].hide();
            }
        },
        // ######################################################### 외부용 함수 시작
        show : function(fn)
        {
            // 레이어를 보여줌
            if(this._dom.is(':visible')){ console.log('이미 레이어가 출력되어 있습니다'); return; }
            
            this._dom.show();
            if(this._opt.onshow && typeof(this._opt.onshow) =='function')
            {
                this._opt.onshow();
            }
        },
        hide : function(fn)
        {
            // 레이어를 숨김
            if(!this._dom.is(':visible')){ console.log('이미 레이어가 숨겨져 있습니다'); return; }

            this._dom.hide();
            if(this._opt.onhide && typeof(this._opt.onhide) == 'function')
            {
                this._opt.onhide();
            }
        },
        init : function(opt)
        {
            if(!opt['title'] || opt['title'] == ''){ throw '레이어 제목이 없습니다.' }
            if(!opt['content'] || opt['content'] == ''){ throw '레이어 내용이 없습니다.' }
            if(!opt['target'] || opt['target'] == ''){ throw '레이어와 변환될 대상요소의 ID가 없습니다.' }
            if(!opt['confirm'] || typeof(opt['confirm']) != 'function'){ throw '확인 버튼 클릭시 실행될 함수가 잘못되었습니다.' }
            
            this._opt = opt;
            this._ajax = $.get(window['__LayerMng']._url )
            .done(function(dom) {
                // 텍스트를 DOM element로 변환한다.
                window['__LayerMng']._dom = $(dom);
                window['__LayerMng']._generate();
                
                // event 객체에 onload 객체가 있으면 실행해라.
                if(opt['onload'] && typeof(opt['onload']) == 'function')
                {
                    opt['onload']();
                }
            })
            .fail(function(){
                throw '레이아웃 html 파일의 위치를 확인해주세요 : [' + window['__LayerMng']._url + "]";
            })
        }
    };

    

})();
