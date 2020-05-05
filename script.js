var c;
var q = new qtnIV();

onload = function(){
    var mouseFlag = false;    
    var mousePositionX = 0.0;
    var mousePositionY = 0.0;
    
    c = document.getElementById('canvas');
    c.width = 600;
    c.height = 600;

    c.addEventListener('mousedown', mouseDown, true);
    c.addEventListener('mouseup', mouseUp, true);
    c.addEventListener('mousemove', mouseMove, true); 
    c.addEventListener('touchstart', ontouChstart, true);
    c.addEventListener('touchend', ontouChend, true);
    c.addEventListener('touchmove', ontouchMove, true); 

    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');
    var prg = create_program(v_shader, f_shader);

    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');

    var attStride = new Array();
    attStride[0] = 3;

    var textData = textPaticle();
    var txtpos_vbo = create_vbo(textData.p);
    var vector     = textData.v;
    var txtVBOList  = [txtpos_vbo];
    var pointPosition = new Float32Array(textData.p);
    
    var uniLocation = new Array();
    uniLocation[0]  = gl.getUniformLocation(prg, 'pointColor');
    
    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    var count = 0;
    var velocity = 0.0;
    var MAX_VELOCITY = 2.0;
    var SPEED = 0.02;
    
    (function render(){
        gl.clearColor(0., 0., 0., 1.);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        count++;
        var pointColor = hsva(count % 360, 1.0, 1.0, 0.5);

        if(mouseFlag){
            velocity = MAX_VELOCITY;
        }else{
            velocity *= 0.95;
        }
        // 点を更新する
        for(i = 0; i < textData.p.length/3; i++){
            // マウスフラグを見てベクトルを更新する
            if(mouseFlag){
                var p = vectorUpdate(
                    pointPosition[i*3],
                    pointPosition[i*3+1],
                    mousePositionX,
                    mousePositionY,
                    vector[i*2],
                    vector[i*2+1]
                );
                vector[i*2]   = p[0];
                vector[i*2+1] = p[1];
            }
            pointPosition[i*3]   += vector[i*2]     * velocity * SPEED;
            pointPosition[i*3+1] += vector[i*2+1] * velocity * SPEED;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, txtVBOList[0]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pointPosition);
        
        set_attribute(txtVBOList, attLocation, attStride);

        gl.uniform4fv(uniLocation[0], pointColor);
        gl.drawArrays(gl.POINTS, 0, textData.p.length/3);

        gl.flush();
        
        requestAnimationFrame(render);
    })();
    
    function mouseDown(eve){
        mouseFlag = true;
    }
    function mouseUp(eve){
        mouseFlag = false;
    }
    function mouseMove(eve){
        if(mouseFlag){
            var cw = c.width;
            var ch = c.height;
            mousePositionX = (eve.clientX - c.offsetLeft - cw / 2.0) / cw * 2.0;
            mousePositionY = -(eve.clientY - c.offsetTop - ch / 2.0) / ch * 2.0;
        }
    }
    function ontouChstart(eve){
        mouseFlag = true;
        console.log(mouseFlag);
    }
    function ontouChend(eve){
        mouseFlag = false;
        console.log(mouseFlag);
    }
    function ontouchMove(eve){
        if(mouseFlag){
            var cw = c.width;
            var ch = c.height;
            var t  = eve.touches[0];
            console.log(t);
            mousePositionX =  (t.pageX - c.offsetLeft - cw / 2.0) / cw * 2.0;
            mousePositionY = -(t.pageY - c.offsetTop - ch / 2.0) / ch * 2.0;
        }
    }
    
    function vectorUpdate(x, y, tx, ty, vx, vy){
        var px = tx - x;
        var py = ty - y;
        var r = Math.sqrt(px * px + py * py) * 5.0;
        if(r !== 0.0){
            px /= r;
            py /= r;
        }
        px += vx;
        py += vy;
        r = Math.sqrt(px * px + py * py);
        if(r !== 0.0){
            px /= r;
            py /= r;
        }
        return [px, py];
    }
    
    // シェーダを生成する関数
    function create_shader(id){
        // シェーダを格納する変数
        var shader;
        
        // HTMLからscriptタグへの参照を取得
        var scriptElement = document.getElementById(id);
        
        // scriptタグが存在しない場合は抜ける
        if(!scriptElement){return;}
        
        // scriptタグのtype属性をチェック
        switch(scriptElement.type){
            
            // 頂点シェーダの場合
            case 'x-shader/x-vertex':
                shader = gl.createShader(gl.VERTEX_SHADER);
                break;
                
            // フラグメントシェーダの場合
            case 'x-shader/x-fragment':
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                break;
            default :
                return;
        }
        
        // 生成されたシェーダにソースを割り当てる
        gl.shaderSource(shader, scriptElement.text);
        
        // シェーダをコンパイルする
        gl.compileShader(shader);
        
        // シェーダが正しくコンパイルされたかチェック
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            
            // 成功していたらシェーダを返して終了
            return shader;
        }else{
            
            // 失敗していたらエラーログをアラートする
            alert(gl.getShaderInfoLog(shader));
        }
    }

    // プログラムオブジェクトを生成しシェーダをリンクする関数
    function create_program(vs, fs){
        // プログラムオブジェクトの生成
        var program = gl.createProgram();
        
        // プログラムオブジェクトにシェーダを割り当てる
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        
        // シェーダをリンク
        gl.linkProgram(program);
        
        // シェーダのリンクが正しく行なわれたかチェック
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        
            // 成功していたらプログラムオブジェクトを有効にする
            gl.useProgram(program);
            
            // プログラムオブジェクトを返して終了
            return program;
        }else{
            
            // 失敗していたらエラーログをアラートする
            alert(gl.getProgramInfoLog(program));
        }
    }
    
    // VBOを生成する関数
    function create_vbo(data){
        // バッファオブジェクトの生成
        var vbo = gl.createBuffer();
        
        // バッファをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        
        // バッファにデータをセット
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        
        // バッファのバインドを無効化
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        // 生成した VBO を返して終了
        return vbo;
    }

    // VBOをバインドし登録する関数
    function set_attribute(vbo, attL, attS){
        // 引数として受け取った配列を処理する
        for(var i in vbo){
            // バッファをバインドする
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            
            // attributeLocationを有効にする
            gl.enableVertexAttribArray(attL[i]);
            
            // attributeLocationを通知し登録する
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
    }
    // IBOを生成する関数
    function create_ibo(data){
        // バッファオブジェクトの生成
        var ibo = gl.createBuffer();
        
        // バッファをバインドする
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        
        // バッファにデータをセット
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        
        // バッファのバインドを無効化
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        // 生成したIBOを返して終了
        return ibo;
    }

    function textPaticle(){
        // 1. canvasを用意してそこに描画したいテキストを描く
        // -------------------------------------------------
        // canvasにテキストを描画するにはgetContextで2Dのコンテキストを取得後
        // にそれに対してフォントとテキストを指定した後でfillTextメソッドを呼
        // び出します。
        var canvas = document.createElement('canvas');
        canvas.width = c.width;
        canvas.height = c.height;
        var context = canvas.getContext("2d");
        context.font = '50pt Meiryo';
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = "middle";
        context.fillText("(´・ω・`)", canvas.width/2, canvas.height/2);

        // 2. canvasから画像データをRGBAの配列として取り出す
        // -------------------------------------------------
        // コンテキストのgetImagetDataメソッドを使って画像データのRGBA配列を取
        // り出します。getImageDataメソッドの戻り値はオブジェクトになっていて
        // - imageData.width
        // - imageData.height
        // - imageData.data
        // という3つのプロパティが参照できます。今回はRGBA配列が欲しいので.data
        // だけ取り出しています。
        var data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        // 3. 配列を1ピクセル分ずつ走査していって色があればその座標にパーティクルを生成する
        // --------------------------------------------------------------------------------
        // 取り出したRGBA配列は4バイトで1ピクセルを表しています。つまり
        // - data[        0] => 1ピクセル目のR(赤)
        // - data[        1] => 1ピクセル目のG(緑)
        // - data[        2] => 1ピクセル目のB(青)
        // - data[        3] => 1ピクセル目のA(アルファ値)
        // - data[1 * 4 + 0] => 2ピクセル目のR(赤)
        // - data[1 * 4 + 1] => 2ピクセル目のG(緑)
        // - data[1 * 4 + 2] => 2ピクセル目のB(青)
        // - data[1 * 4 + 3] => 2ピクセル目のA(アルファ値)
        // - data[2 * 4 + 0] => 3ピクセル目のR(赤)
        // - data[2 * 4 + 1] => 3ピクセル目のG(緑)
        // - data[2 * 4 + 2] => 3ピクセル目のB(青)
        // - data[2 * 4 + 3] => 3ピクセル目のA(アルファ値)
        // という風にならんでいます。先に紹介したサンプルURLではピクセルが白
        // でない場合にその座標にドットがあるとみなしていますが、ピクセルのア
        // ルファ値明度が0の場合、つまりdata[i * 4 + 3]が0であれば、そこには
        // ドットがないとみなすこともできます。
        // そのようにチェックして透明ではないピクセルのxとyをオブジェクトの座
        // 標に指定してあげばパーティクルで描くテキストの完成です。オブジェク
        // トに貼り付けるテクスチャは、先に20個作っておいたものからランダムで
        // 選択します。
        var max_x = 0.;
        var pos = new Array();
        var col = new Array();
        var vec = new Array();
        for (var x = 0; x < canvas.width; x++) {
            for (var y = 0; y < canvas.height; y++) {
                if (data[(x + y * canvas.width) * 4 + 3] == 0) {
                    continue;
                }
                if(max_x<(x-canvas.width/2)*((x-canvas.width/2)/(x-canvas.width/2))){
                    max_x = (x-canvas.width/2)*((x-canvas.width/2)/(x-canvas.width/2));
                }
                pos.push(x-canvas.width/2, -y+canvas.width/2, 0);
                col.push(0., 1., 1., 1.);
                vec.push(0., 0.);
            }
        }
        for(var i=0; i<pos.length; i++){
            pos[i] = pos[i]/(max_x*1.5);
        }
        return {p:pos, c:col, v:vec};
    }

    function create_texture(source, number){
        // イメージオブジェクトの生成
        var img = new Image();
        
        // データのオンロードをトリガーにする
        img.onload = function(){
            // テクスチャオブジェクトの生成
            var tex = gl.createTexture();
            
            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, tex);
            
            // テクスチャへイメージを適用
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            
            // ミップマップを生成
            gl.generateMipmap(gl.TEXTURE_2D);
            
            // テクスチャのバインドを無効化
            gl.bindTexture(gl.TEXTURE_2D, null);
            
            // 生成したテクスチャを変数に代入
            switch(number){
                case 0:
                    texture0 = tex;
                    break;
                case 1:
                    texture1 = tex;
                    break;
                default:
                    break;
            }
        };
        
        // イメージオブジェクトのソースを指定
        img.src = source;
    }
};