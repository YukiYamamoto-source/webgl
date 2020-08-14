class Link{
    constructor(m){
        this.Mt  = Math.random()*5;//m;
        var range = 3000;
        this.K = Math.random()*500;
        this.B = Math.random()*1;
        this.spring1 = new THREE.Vector3(Math.round(Math.random()*range*3)-1.5*range, Math.round(Math.random()*range*1.2), Math.round(Math.random()*range)-range/2);
        this.pos = this.spring1.clone();
        this.vec = new THREE.Vector3(0,0,0);
        this.link_f = new THREE.Vector3(0,0,0);

        this.pos_a_0 = [new THREE.Vector3(0,50,0)];
        this.pos_a   = this.pos_a_0.concat();

        this.In      = new THREE.Matrix3();
        var temp = this.Mt*100*100*2/3;
        this.In.set(temp, 0., 0.,
                     0.,temp, 0.,
                     0., 0.,temp);
        this.invI      = new THREE.Matrix3();
        this.invI.set(1/temp,   0.,   0.,
                         0.,1/temp,   0.,
                         0.,   0.,1/temp);
 
        this.Rot      = new THREE.Matrix3();
        this.Rot.set(Math.cos(0.),0.,-Math.sin(0.),
                               0.,1.,           0.,
                     Math.sin(0.),0., Math.cos(0.));

        this.Rot4      = new THREE.Matrix4();
        this.Rot4.set(Math.cos(0.),0.,-Math.sin(0.),0.,
                                0.,1.,           0.,0.,
                      Math.sin(0.),0., Math.cos(0.),0.,
                                0.,0.,           0.,1.);
        this.omg    = new THREE.Vector3();
        this.link_t = new THREE.Vector3(0.,0.,0.);
        
        this.first_time = 1;
    }

    updata_pos_a(){
        this.link_f = new THREE.Vector3();
        this.link_t = new THREE.Vector3();
        for(let i=0;i<this.pos_a.length;i++)
        {
            this.pos_a[i] = this.pos_a_0[i].clone().applyMatrix3(this.Rot);
            this.pos_a[i] = this.pos_a[i].add(this.pos);
        }
    }

    update_phis(){
        var  a   = this.link_f.multiplyScalar(1/this.Mt).add(g);
        this.vec = this.vec.addScaledVector(a,T);
        this.pos = this.pos.addScaledVector(this.vec,T);

        var tmp_omg = this.omg.clone();
        var tmp_tau = this.link_t.clone();
        var RT      = this.Rot.clone().transpose();
        var RTomg   = tmp_omg.clone().applyMatrix3(RT);
        var RTtau   = tmp_tau.clone().applyMatrix3(RT);

        var acc = this.mul_MatVec(this.In, RTomg);
            acc = RTomg.clone().cross(acc);
            acc = RTtau.clone().add(acc.multiplyScalar(-1));
            acc = this.mul_MatVec(this.invI, acc);
            acc = this.mul_MatVec(this.Rot, acc);

        this.omg  = this.omg.addScaledVector(acc,T);
        var omgT  = this.omg.clone().multiplyScalar(T);
        
        if(0){//自前で作成した関数を利用して回転行列を更新（どっちを使ってもいい）
            this.Rot4 = this.updateRot(this.Rot4, omgT); 
        }
        else{//THREE.jsの関数を利用して回転行列を更新
            var temp = new THREE.Matrix4();
            temp.makeRotationAxis(omgT.clone().normalize(), omgT.length());
            this.Rot4 = temp.multiply(this.Rot4);
        }

        this.Rot.set(this.Rot4.elements[0],this.Rot4.elements[4],this.Rot4.elements[8],
                     this.Rot4.elements[1],this.Rot4.elements[5],this.Rot4.elements[9],
                     this.Rot4.elements[2],this.Rot4.elements[6],this.Rot4.elements[10]);
    }

    mul_MatVec(mat, vec){
        var temp = new THREE.Vector3(mat.elements[0]*vec.x + mat.elements[3]*vec.y + mat.elements[6]*vec.z,
                                     mat.elements[1]*vec.x + mat.elements[4]*vec.y + mat.elements[7]*vec.z,
                                     mat.elements[2]*vec.x + mat.elements[5]*vec.y + mat.elements[8]*vec.z,);
        return temp;
    }

    updateRot(pR, omgT){
        var ang = omgT.length();
        var K   = this.gais(omgT);
        var KR  = K.clone().multiply(pR);
        var KKR = K.clone().multiply(KR);

        KR  = KR.multiplyScalar(Math.sin(ang)/ang);
        KKR = KKR.multiplyScalar(this.cosc(ang));
        pR = this.addMatrix4(pR,KR);
        pR = this.addMatrix4(pR,KKR);
        pR = this.ortho(pR);
        return pR;
    }

    addMatrix4(A, B){
        var temp = new THREE.Matrix4();
        temp.set(A.elements[ 0]+B.elements[ 0],A.elements[ 4]+B.elements[ 4],A.elements[ 8]+B.elements[ 8],A.elements[12]+B.elements[12],
                 A.elements[ 1]+B.elements[ 1],A.elements[ 5]+B.elements[ 5],A.elements[ 9]+B.elements[ 9],A.elements[13]+B.elements[13],
                 A.elements[ 2]+B.elements[ 2],A.elements[ 6]+B.elements[ 6],A.elements[10]+B.elements[10],A.elements[14]+B.elements[14],
                 A.elements[ 3]+B.elements[ 3],A.elements[ 7]+B.elements[ 7],A.elements[11]+B.elements[11],A.elements[15]+B.elements[15]);
        return temp;
    }

    cosc(x){
        return (1-Math.cos(x))/x**2
    }

    gais(omgT){
        var temp = new THREE.Matrix4();
        temp.set(      0, -omgT.z,  omgT.y, 0,
                  omgT.z,       0, -omgT.x, 0,
                 -omgT.y,  omgT.x,       0, 0,
                       0,       0,       0, 0);
        return temp;
    }

    //グランシュミットの正規直行化（４次元行列用）
    ortho(pmat){
        var temp = pmat.clone();
        var a = 1./Math.sqrt(temp.elements[0]**2+temp.elements[1]**2+temp.elements[2]**2+temp.elements[3]**2);
        var n00 = temp.elements[0]*a;
        var n10 = temp.elements[1]*a;
        var n20 = temp.elements[2]*a;
        var n30 = temp.elements[3]*a;

              a = n00*temp.elements[4]+n10*temp.elements[5]+n20*temp.elements[6]+n30*temp.elements[7];
        var n01 = temp.elements[4] - a*n00;
        var n11 = temp.elements[5] - a*n10;
        var n21 = temp.elements[6] - a*n20;
        var n31 = temp.elements[7] - a*n30;

          a  = 1./Math.sqrt(n01**2+n11**2+n21**2+n31**2);
        n01 *= a;
        n11 *= a;
        n21 *= a;
        n31 *= a;

            a = n00*temp.elements[8]+n10*temp.elements[9]+n20*temp.elements[10]+n30*temp.elements[11];
        var b = n01*temp.elements[8]+n11*temp.elements[9]+n21*temp.elements[10]+n31*temp.elements[11];
        var n02 = temp.elements[ 8] - a*n00 - b*n01;
        var n12 = temp.elements[ 9] - a*n10 - b*n11;
        var n22 = temp.elements[10] - a*n20 - b*n21;
        var n32 = temp.elements[11] - a*n30 - b*n31;

        a  = 1./Math.sqrt(n02**2+n12**2+n22**2+n32**2);
        n02 *= a;
        n12 *= a;
        n22 *= a;
        n32 *= a;

              a = n00*temp.elements[12]+n10*temp.elements[13]+n20*temp.elements[14]+n30*temp.elements[15];
              b = n01*temp.elements[12]+n11*temp.elements[13]+n21*temp.elements[14]+n31*temp.elements[15];
        var   c = n01*temp.elements[12]+n11*temp.elements[13]+n21*temp.elements[14]+n31*temp.elements[15];
        var n03 = temp.elements[12] - a*n00 - b*n01 - c*n02;
        var n13 = temp.elements[13] - a*n10 - b*n11 - c*n12;
        var n23 = temp.elements[14] - a*n20 - b*n21 - c*n22;
        var n33 = temp.elements[15] - a*n30 - b*n31 - c*n32;

        a  = 1./Math.sqrt(n03**2+n13**2+n23**2+n33**2);
        n03 *= a;
        n13 *= a;
        n23 *= a;
        n33 *= a;

        return temp.set(n00,n01,n02,n03,
                        n10,n11,n12,n13,
                        n20,n21,n22,n23,
                        n30,n31,n32,n33);
    }

    get GetPos(){
        return this.pos.clone();
    }

    get GetVec(){
        return this.vec.clone();
    }

    GetPosA(i){
        return this.pos_a[i].clone();
    }
}


class simulator{
    constructor(){
        this.first_time = 1;

        this.box1 = [];
        for(i=0;i<boxnum;i++) this.box1.push( new Link(1) );
        // サイズを指定
        const width  = window.innerWidth;
        const height = window.innerHeight;

        
        // レンダラーを作成
        this.c = document.getElementById('canvas');
        const canv_width  = width-this.c.offsetLeft*2;
        const canv_height = height-this.c.offsetTop;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( canv_width, canv_height);
        this.c.width = canv_width;
        this.c.height = canv_height;
        this.c.appendChild( this.renderer.domElement );

        // シーンを作成
        this.scene = new THREE.Scene();

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera(45, canv_width / canv_height, 1, 10000);
        this.camera.lookAt(new THREE.Vector3(-250,150,400));

        // 箱を作成
        var geometry_box = new THREE.BoxGeometry(100, 100, 100);
        var material_box = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1 });

        var geo = new THREE.EdgesGeometry( geometry_box );
        var mat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );
        this.wireframe = [];
        this.box = [];
        for(var i=0;i<boxnum;i++){
            this.box.push( new THREE.Mesh(geometry_box, material_box.clone()) );
            this.wireframe.push( new THREE.LineSegments( geo, mat ) );
            this.box[i].add( this.wireframe[i] );
            this.scene.add(this.box[i]);
        }

        var gridHelper = new THREE.GridHelper( 10000, 100 );
        this.scene.add( gridHelper ); 

        var light = new THREE.AmbientLight( 0xffffff, 1.0 );
        this.scene.add( light );

        // new THREE.Fog(色, 開始距離, 終点距離);
        this.scene.fog = new THREE.Fog(0x000000, 50, 10000);
    }
    
    main_loop(){
        for(var i=0;i<boxnum;i++){
            this.box1[i].updata_pos_a();

            if(this.first_time==1){
                pre_posA1[i].copy(this.box1[i].GetPosA(0));
            }
            var vec1 = this.box1[i].GetPosA(0).add(pre_posA1[i].multiplyScalar(-1)).multiplyScalar(1/T);
            var K = this.box1[i].K;
            var B = this.box1[i].B;
            var F1 = this.box1[i].spring1.clone().addScaledVector(this.box1[i].GetPosA(0),-1);
            F1.multiplyScalar(K).add(vec1.multiplyScalar(-B));
            
            this.box1[i].link_f.add(F1);
            this.box1[i].link_t.add(this.box1[i].GetPosA(0).add(this.box1[i].GetPos.multiplyScalar(-1)).cross(F1));
            
            pre_posA1[i].copy(this.box1[i].GetPosA(0));
            
            this.box1[i].update_phis();
            this.box[i].position.copy(this.box1[i].GetPos);
            this.box[i].setRotationFromMatrix(this.box1[i].Rot4);
            if(flag==1){
                this.box[i].geometry.colorsNeedUpdate = true;
                var hsl;
                hsl = this.box[i].material.color.getHSL(this.box[i].material.color);
                this.box[i].material.color.setHSL(hsl.h+Math.sign(Math.random()-0.5)*0.005, 0.8, 0.7);
                this.wireframe[i].material.color.set("black");
                if(sw==1){
                    this.box1[i].K = Math.random()*5000; 
                    this.box1[i].B = Math.random()*100;
                    this.box1[i].Mt = Math.random()*0.5;
                    if(i==boxnum-1) sw = 0;
                }
            }
            else{
                this.wireframe[i].material.color.set("gray");
                if(sw==0){
                    this.box1[i].K = Math.random()*500.; 
                    this.box1[i].B = Math.random()*1;
                    this.box1[i].Mt = Math.random()*10;
                    if(i==boxnum-1) sw = 1;
                }
            }
        }
        
        this.first_time = 0;
        this.camera.position.set(apply_F.x,apply_F.y,apply_F.z);
        this.renderer.render(this.scene, this.camera);
    }
}

function reset_force(){
    apply_F = origin;
}

function add_force(x,y,z){
    apply_F.add(new THREE.Vector3(x,y,z));
}

document.body.addEventListener('keydown',
event => {
    if (event.key === " ") {
        reset_force();
    }
    else if (event.key === 'ArrowLeft' ) {
        add_force(-f,0,0);
    }
    else if (event.key === 'ArrowRight') {
        add_force(f,0,0);
    }
    else if (event.key === 'ArrowDown' ) {
        add_force(0,0,f);
    }
    else if (event.key === 'ArrowUp') {
        add_force(0,0,-f);
    }
    else if (event.key === 'u' ) {
        add_force(0,f,0);
    }
    else if (event.key === 'd') {
        add_force(0,-f,0);;
    }
});

window.addEventListener('load', function(){
    document.getElementById( "canvas" ).onmouseup = function(){
        if(flag==0){ flag = 1; }
        else       { flag = 0; }
    };
    document.getElementById( "canvas" ).ontouchcancel = function(){
        if(flag==0){ flag = 1; }
        else       { flag = 0; }
    };
});
// ページの読み込みを待つ
var flag = 0;
var T = 0.001;
var f = 5.;
var sw = 0;
var g = new THREE.Vector3(0, -9810., 0);
var boxnum = 300;
var pre_posA1 = [];
for(var i=0;i<boxnum;i++){
    pre_posA1.push( new THREE.Vector3() );
}
var apply_F   = new THREE.Vector3(3000,50,-3000);
var origin    = apply_F.clone();
var SIM=new simulator;

window.setInterval(function(){SIM.main_loop()}, T*1000);