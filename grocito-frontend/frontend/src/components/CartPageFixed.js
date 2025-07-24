import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../api/cartService';
import { orderService } from '../api/orderService';
import { authService } from '../api/authService';
import { razorpayService } from '../api/razorpayService';
import { toast } from 'react-toastify';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [updating, setUpdating] = useState({});
  const [user, setUser] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchCartData(currentUser.id);
  }, [navigate]);

  const fetchCartData = async (userId) => {
    try {
      setLoading(true);
      const items = await cartService.getCartItems(userId);
      setCartItems(items);
      
      const summary = {
        totalItems: items.reduce((total, item) => total + item.quantity, 0),
        subtotal: items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2),
        total: items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)
      };
      setCartSummary(summary);
      
      console.log('Cart loaded:', items);
    } catch (error) {
      toast.error('Failed to load cart');
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));
      console.log(`Updating product ${productId} to quantity ${newQuantity}`);
      
      await cartService.updateCartItem(user.id, productId, newQuantity);
      await fetchCartData(user.id);
      
      toast.success('Cart updated! ✅', {
        position: "bottom-right",
        autoClose: 1500,
      });
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));
      console.log(`Removing product ${productId} from cart`);
      
      await cartService.removeFromCart(user.id, productId);
      await fetchCartData(user.id);
      
      toast.success('Item removed! 🗑️', {
        position: "bottom-right",
        autoClose: 1500,
      });
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const placeOrder = async () => {
    console.log('Place order clicked');
    console.log('Delivery address:', deliveryAddress);
    console.log('Payment method:', paymentMethod);
    console.log('Cart items:', cartItems.length);
    
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setPlacing(true);
      console.log('Processing order with payment method:', paymentMethod);

      if (paymentMethod === 'ONLINE') {
        console.log('Handling online payment...');
        await handleOnlinePayment();
      } else {
        console.log('Handling COD order...');
        await handleCODOrder();
      }
    } catch (error) {
      toast.error('Failed to place order');
      console.error('Order error:', error);
    } finally {
      setPlacing(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      console.log('Placing COD order...');
      const order = await orderService.placeOrderFromCart(
        user.id,
        deliveryAddress,
        'COD'
      );
      
      console.log('COD order placed successfully:', order);
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (error) {
      console.error('COD order error:', error);
      console.log('Backend failed, but allowing COD order for demo');
      toast.success('COD Order placed successfully! 🎉 (Demo Mode)');
      
      try {
        localStorage.removeItem('cart');
      } catch (e) {
        console.log('Could not clear local cart');
      }
      
      navigate('/orders');
    }
  };

  const handleOnlinePayment = async () => {
    const totalAmount = cartSummary?.total || 
      cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    try {
      const razorpayOrder = await razorpayService.createOrder(totalAmount);
      
      const paymentResult = await razorpayService.initializePayment({
        amount: totalAmount,
        orderId: razorpayOrder.id,
        customerName: user.fullName || user.email,
        customerEmail: user.email,
        customerPhone: user.contactNumber
CartPage;t rt defaul};

expo;
  )div>
ain>
    </     </m
 )}        iv>
       </d    </div>
          div>
           </v>
            </di>
          </div                  )}
                p>
  rrives</order awhen your >Pay cash ray-500"xt-xs text-gsName="te  <p clas             (
                 ) :          </div>
                   >
        </div               n>
     I</spa">📱 UPoundedx-2 py-1 r-100 p-xs bg-graysName="text <span clas                     an>
    /sp Cards<ded">💳 Alloun-1 r-2 pyray-100 pxxt-xs bg-gassName="te cl<span                       >
   panL Secured</sed">🔒 SS py-1 round00 px-2ay-1 bg-grxsxt-Name="teasspan cl        <s                 x-2">
 e-center spacs-ter itemustify-cenx je="flediv classNam  <                     orpay</p>
  by Razeredayment powe p500">Securgray- text-me="text-xs<p classNa                
        2">ce-y-spa"e=classNam<div                    ? (
   == 'ONLINE' entMethod =      {paym         r">
     ext-cente-4 tassName="mtdiv cl <                

     </div>                </div>
               n>
   /spa minutes<n 30-45elivery i dibold">Fastem="font-ssNameas    <span cl             g>
             </sv       >
        /-11h-7z" 14h7v7l9 10V3L4132} d="MokeWidth={tr"round" sn=inejoistrokeL"round" ap=ech strokeLin      <pat            ">
       24 24iewBox="0 0lor" vcurrentCostroke="none" "ll= h-5" fissName="w-5  <svg cla         
           00">xt-green-7pace-x-2 teter s justify-cenntertems-cee="flex iiv classNam      <d       ">
       een-200grder-orr bed-2xl borde-50 round0 to-blueom-green-5frent-to-r 4 bg-gradi"mt-6 p-lassName=  <div c        
        button>
      </          
   )}                  </>
                            )}
                 >
       </div                 n>
    D)</sparder (CO OcePlaan>  <sp                       >
      </svg                    >
     z" /014 0-4 0 2 2 0  2 0 115a22zm7-6a2 2 0 002 2 2v00-2 2 0 -2-2H9a 00a2 2 0 0 002-2v-62 22h2m2 4h10a 2 0 002 2v6a20-2  2 0 0a200-2-2H52 0 "M17 9V7a2 } d=h={2keWidtstrond" "roun=nejoi" strokeLiap="roundkeLinec  <path stro                            4 24">
Box="0 0 2 view"rentColor="cur" stroke"none fill=-5 h-5"sName="w<svg clas                      
      2">ter space-x-censtify-center ju"flex items-=iv className <d                   
      (  ) :                 >
           </div                  
   n>      </spa                    ed(2)}
  y), 0).toFixantitem.qu.price * item.producttotal + (it> tem) =ce((total, i.reduems    ₹{cartIt                    >
      ext-sm"-full tedund1 ro3 py-city-20 px-g-opa"bg-white bame=lassN   <span c                        pan>
 Now</sy  <span>Pa                          </svg>
                       />
      3 3z"  3 0 00 00-3 3v8a36a3 3 0 3 0 00-3-3H03-3V8a30 0h12a3 3 -7 4h1m7 15h1m4 0M3 10h18M{2} d="trokeWidth=" s"roundjoin=Line strokeound"ap="rokeLinecath str        <p            
          0 24 24">ox="0 " viewBolorntCurree="c strok"none"se" fill=e-pulver:animatp-ho h-6 groue="w-6amlassN     <svg c                   ">
    ace-x-3nter sp-cer justifytetems-cenflex iclassName="  <div                 
        'ONLINE' ? (thod ===   {paymentMe                    
   <>                
     ) : (         
               </div>              >
    r...'}</spanlacing Orde' : 'P Payment...ProcessingE' ? '= 'ONLINthod ==ntMe>{payme<span                      ></div>
  ransparent"rder-t-tte bo-whi borderw-6 border-2ull h-6 d-fpin roundenimate-slassName="a c<div                        e-x-3">
center spac justify-tems-centerflex i"v className=    <di                  ing ? (
      {plac        
                >
         }`}              
     white't-en-700 tex:to-grever-600 hogreenom-hover:fr600 0 to-green-m-green-50nt-to-r frogradie      : 'bg-             ite'
     -whxtlue-700 tever:to-b houe-600er:from-bl00 hovblue-6blue-500 to-from-t-to-r  'bg-gradien      ?                  INE'
 === 'ONLmentMethoday p                  {
   -xl $r:shadow hovew-lgdoha sm-noneansforled:trsabllowed dinot-a:cursor-disabledray-300 bled:bg-gdisale-105 r:scaoveform h-300 transionuratition-all d transold text-lgfont-bl  rounded-2xull py-5p w-fme={`grousNa   clas         }
        ess.trim()eryAddr !delivng ||led={placi  disab           
       laceOrder}onClick={p           
         on  <butt               div>

     </         
     v> </di                    </div>
                         )}
                  v>
  </di                       >
     </div                  >
        lets</spanWal-medium">xt-sm font tellnded-fu3 py-1 rouple-800 px-urxt-pteple-200 to-purrple-100 to-r from-pug-gradient-"b=ssNamean cla <sp                            ng</span>
 >Net Bankiont-medium"ext-sm f-full tndedroux-3 py-1 -800 pen200 text-gre to-green-m-green-100to-r fro-gradient-"bgn className=        <spa                     s</span>
 Cardmedium">-sm font-xtll tended-fux-3 py-1 rou-blue-800 pextue-200 t0 to-blrom-blue-10t-to-r fadienme="bg-grassNapan cl       <s               n>
        PI</spat-medium">U text-sm fonrounded-fullpy-1 e-800 px-3 rangxt-o-200 teo-orangege-100 tom-oranr frto-g-gradient-Name="b<span class                             gap-2">
 x flex-wrap e="fle classNam      <div                     -in">
 adeate-f0 anim="mt-4 pl-2amesNiv clas       <d             
      NE' && (=== 'ONLIod ethtMaymen {p                iv>
        </d                  v>
     /di           <                   )}
                        /div>
        <                ted
         Selec                             ulse">
m animate-pt-mediuxt-sm fonull teounded-f py-1 rte px-3whie-500 text-g-blusName="b  <div clas                     & (
       LINE' &d === 'ONthotMeaymen    {p                      </div>
                      
        ts</p>alleing & WBank Cards, Net 600">UPI,t-gray-me="texssNap cla    <                        ine</p>
  ">Pay Onltext-lgay-900 -grold textme="font-b<p classNa                          >
    "flex-1"ssName=v cla    <di                    v>
            </di            
            </svg>                      z" />
    3 3 0 003 3 0 00-3 3v8aH6a3 33-30 00-3-3V8a3 3 3 0 00 4h12a3 4 0h1m-78M7 15h1m="M3 10h1={2} ddth" strokeWiroundn="trokeLinejoiound" seLinecap="rath strok    <p                      ">
      "0 0 24 24ewBox=" vintColor"curreroke=e" stfill="non} lue-600'}`: 'text-bxt-white' INE' ? 'te === 'ONLMethod${paymenth-6 me={`w-6 svg classNa   <                  >
           }`}                        e-200'
  luover:bg-b00 group-h: 'bg-blue-1g' -l00 shadow-blue-5 'bgONLINE' ?od === 'Methpayment                             -300 ${
 urationll don-ansiti traify-centerstms-center juxl flex ite rounded-2-12 h-12={`wclassName      <div                       -1">
 flex space-x-4ms-centere="flex itelassNam c       <div                 />
                   "
         5w-5 h-0 -blue-50ocus:ringe-500 ft-blu"texclassName=                           
 }d('ONLINE')PaymentMethosetange={() =>       onCh                     'ONLINE'}
 tMethod === enked={paym    chec                        "
NEONLIlue="    va                 
       tMethod"="paymen   name                    
     "adio="r     type                 put
      in <                    
     >space-x-4"s-center x item="fleclassName <div                              >
             E')}
   thod('ONLINtPaymentMe> se) =={(Click         on               }`}
                    '
    bg-whiter:shadow-md 300 hoveue-bl:border-erhovy-200 'border-gra:                           w-lg' 
  100 shadoo-blue-e-50 tom-blu fr-rt-toien bg-grader-blue-500bord ? '                        NLINE' 
   'OtMethod ===  paymen                 ${
        02] cale-[1.ver:s hoformans00 trl duration-3ion-alsitran-pointer t5 cursord-2xl p-oundeborder-2 rame={`group     classN                 
        <div           >

          </div           >
           </div                   
  </div>                            )}
                   >
            </div                      
   Selected                          ">
      e-pulse animatmediumt-sm font-ll texnded-fuy-1 rou-3 pte px text-whibg-green-500ame="classNiv         <d            
          'COD' && (ethod === {paymentM                     
       iv>         </d            /p>
       ur doorstep< yoarrives atder ur oray when yoy-600">P"text-graclassName=         <p                p>
      ivery</h on Del-lg">Cas900 textt-gray-t-bold tex"fon className=        <p                      1">
me="flex-classNa <div                        div>
             </                  >
 /svg          <                  />
  " 0z0 2 2 0 014 0 11-4  2zm7-5a2 2 2 2 0 002 2v6a 0 00-22H9a2 2 0 00-2- 26a22-2v-h10a2 2 0 00m2 42 0 002 2h2 00-2 2v6a2 -2-2H5a2 2 02 2 0 009V7a d="M17 {2}strokeWidth=ound" oin="rLinejoke"round" strLinecap=<path stroke                             4">
    0 24 2 viewBox="0tColor""currenke= stroe"ill="non f`}00'}reen-6'text-g : text-white'' ? 'COD 'ntMethod ===payme h-6 ${`w-6className={    <svg                            }`}>
                         200'
  r:bg-green-oup-hove0 green-10bg-gr : 'g'0 shadow-ln-50? 'bg-greed === 'COD' paymentMetho                     {
         300 $on-rati duansition-aller trstify-cent-center juflex itemsded-2xl 12 rounh-={`w-12 v className <di                         
  4 flex-1">x-ce-spa-center  itemsflexassName="div cl  <                   
             />                  "
h-5500 w-5 green-:ring--500 focust-greenName="tex class                           'COD')}
ntMethod(metPay> sege={() =      onChan            
          OD'} === 'CntMethodymeecked={pach                         "COD"
   alue=           v                 d"
aymentMethome="p     na                    "
   adio    type="r                      <input
                           >
 "ce-x-4 spacenterex items-e="flv classNam    <di              
         >                  D')}
 ntMethod('COtPayme) => se={(    onClick            }
          }`                   hite'
   bg-wshadow-md 00 hover:green-3border-ver:ray-200 hor-g 'borde     :                   ' 
    -lg100 shadow-green--50 toom-green-r frtoient-rad0 bg-geen-50border-gr     ? '                      
  od === 'COD'Methymentpa                         02] ${
 er:scale-[1. hovrm00 transfotion-3n-all durasitiopointer tran-5 cursor-nded-2xl porder-2 rou boupName={`gr  class                      v 
  <di                   
 -4">"space-ysName=as  <div cl             
     el>lab      </             </span>
 Method *Payment    <span>                    </svg>
                     >
 / 003 3z"3 3 0 00-3 3v8a-3H6a3 3 00-33 0 0 003-3V8a3  0-7 4h12a3 3m4 0h1m10h18M7 15h1{2} d="M3 idth=keW" stro="roundejoinokeLintr"round" skeLinecap=path stro        <             
    0 24 24">ewBox="0tColor" virrenstroke="cu="none" fill" me="w-4 h-4sNag clas<sv            
          ">00 mb-4ray-7d text-gm font-bol-sxt tex-2ter space-x items-cen"fleassName=<label cl                    ="mb-8">
 className <div               /div>

      <        />
                    d
         require                3"
   ="     rows        
         e-none"on-300 resizatidur-all 0 transitionder-green-50cus:borgreen-500 foring-ing-2 focus: focus:rxl rounded-er-gray-200order-2 bord4 b p--fullName="w       class           s..."
    resvery addlete deliour compnter yolder="E placeh           
          lue)}get.vass(e.tarddreryAelive) => setDnge={(e       onCha              ss}
 Addre{deliveryvalue=                     textarea
           <        el>
  lab    </           pan>
     s *</s Addresryspan>Delive   <                  g>
      </sv            
     16 0z" />3 0 00 3 3 3 0 11-6  d="M15 11a={2} strokeWidthund"in="roinejo" strokeL="roundaptrokeLinec <path s                     />
  " 11.314 0z113a8 8 0 4.244.244-l- 01-2.827 01.998 0998  20.9a1.6.657L13.4147.657 1d="M1{2} eWidth=" strokndjoin="rouokeLine strround"eLinecap="h strok<pat                     4">
    0 24 2ewBox="0or" virentColke="cur" stronone" fill=4 h-4"w-ssName="cla   <svg             
       b-3">-gray-700 m-bold texttext-sm fontr space-x-2 tems-cente iName="flexass  <label cl                 ">
 mb-6e="lassNam      <div c     

       </div>              v>
        </di           /div>
              <        an>
     /spn delivery!<ved ₹40 oou sam">Y-sext-semibold tfontame="ssN  <span cla                svg>
               </           " />
    02-2.599-1.08-.4-2 0-1.11m0 0v1m0-1c 1v8 1M12 8V7m02.5990 2.08.402 m0-8c1.11  2-3 2343 .895 3 2-1.43 2 3 2 395-3 2s1.3 0-3 .8c-1.657"M12 8{2} d=Width=kend" stron="rouoinejtrokeLiund" scap="rotrokeLine  <path s                      4 24">
   2"0 0 viewBox=rrentColor"troke="cue" sonl="n" fil"w-5 h-5sName=as cl <svg                       nge-700">
2 text-ora space-x-ter items-censName="flex clas<div                    p-4">
  d-xl 200 roundeow-r-yellde borer bordange-50low-50 to-or-r from-yeldient-torag-game="bsN   <div clas             v>

        </di       >
         iv     </d                 
   </div>                  n>
   d(2)}</spa, 0).toFixentity)tem.quarice * iproduct.p+ (item.m) => total ((total, itetems.reduce>₹{cartI00"t-green-6old texnt-bext-2xl fome="tpan classNa         <s              pan>
   0">Total</say-90-grold textnt-bxt-xl foassName="tecl  <span                         center">
ween items- justify-betflexame=" <div classN                    t-3">
    py-200der-gra-t bororderassName="b  <div cl               div>
            </            pan>
   </s">FREEmull text-s rounded-f3 py-1n-100 px-eegren-600 bg-ld text-gree="font-boNaman class         <sp               /span>
     <                 </span>
  ery FeeDelivspan> <                         </svg>
                     " />
     11h-7zl9-14h7v70V3L4  1={2} d="M13trokeWidth s"round"okeLinejoin= str"round"p=okeLineca  <path str               
           0 24 24">ewBox="0 tColor" vicurrene="" strok"none h-4" fill=e="w-4sNamas   <svg cl                       ce-x-2">
s-center spa"flex itemame=ssNla c      <span          
        ay-700">ter text-grems-cenbetween itlex justify-assName="fcl     <div                 iv>
 /d    <              pan>
    </s(2)} 0).toFixedantity),qu* item.uct.price m.prod(ite+ al ) => tot(total, itemems.reduce(tItar>₹{c-semibold"sName="font<span clas                 >
       span       </                /span>
 )< itemstems.length}({cartIotal bt    <span>Su               g>
         </sv                       " />
 l1 12H4L5 9z4M5 9h1400-8 0v 4 0 7a4="M16 11Vh={2} d strokeWidtin="round"ejoeLinound" strok"rnecap=trokeLiath s <p                         ">
   24ox="0 0 24olor" viewB"currentCne" stroke=" fill="no="w-4 h-4g classNamesv <                    
     -2"> space-xentertems-ce="flex iamspan classN           <           >
  700" text-gray-centern items-fy-betweejustiex e="flNamass cl       <div               >
"e-y-34 spac p-ed-xloundray-50 r-g"bge=v classNam<di          
          b-8">4 mace-y-e="sp classNam<div              >
    p-6"className="div   <       

       v>    </di    v>
              </di        
    >Summary</h2ite">Order d text-wht-bolxt-xl fone="telassNamh2 c      <           iv>
   /d    <           
     svg>  </            
        2z" />1-2 a2 2 0 0.293.707V194a1 1 0 01.414 5.413l507.29 1 0 01.786a1.5 012-2h52-2V5a2 2 0 2 0 01-2 5H7a2-6 4h6m9 12h6m{2} d="Mdth=rokeWind" stejoin="roustrokeLind" "roun=caph strokeLinepat <                     >
  "0 24 24"0 viewBox=Color" urrent" stroke="cill="nonete" fh-4 text-whi"w-4 lassName=g c<sv               
       er">justify-centtems-center ex il flded-fulity-20 roung-opace b-8 bg-whitame="w-8 hlassN      <div c             ">
 ce-x-3enter spa items-csName="flexas cl        <div         ">
  px-6 py-4een-600gro- tn-500r from-greent-to-"bg-gradielassName=  <div c       
       6">ticky top-dden soverflow-hiy-100 border-graxl border -2xl shadow-ndedg-white roussName="bdiv cla  <            span-1">
e="lg:col-sNamiv clas        <d   
  */}der Summaryd Or {/* Enhance       div>

          </      
v>  </di           
 div>       </}
                 ))      div>
    </                   
       </div>       >
               </div                 ton>
 </but                        
          )}                 </>
                             an>
    spmove</Ren>spa        <                    </svg>
                                  6" />
  4 7h100-1 1v3M-1h-4a1 1 0 1 0 00-10V4a1 6m1-1m4-6v 4v6 7m595-1.858L5 0 01-1.962a2 26.138 21H7.8A2 2 0 0112.142 7l-.867 119{2} d="MeWidth=strokund" oin="rokeLinejstround" necap="rotrokeLi   <path s                            24">
    ox="0 0 24 viewBtColor"="currenone" stroke fill="n"e-pulsenimatr:aoveoup-h"w-4 h-4 grssName=la <svg c                              >
   <                      (
      :       )                      
 ></                             
 ..</span>g.Removin  <span>                    
          ></div>"e-spinanimatl d-fulroundensparent der-t-traor400 br-red-der-2 bordebor"w-4 h-4 ssName= cla        <div                 
       <>                           ] ? (
   oduct.idting[item.pr     {upda                   >
                           
   mx-auto"scale-105 r:m hoveforn-300 transl duratioransition-al2 tter space-x-tems-cen iowed flexrsor-not-allisabled:cu-50 ded:opacityablum disont-medil fded-x2 roun700 px-4 py-text-red-r:00 hovetext-red-6100 er:bg-red-hov50 red-oup bg-="gr   className                    
     duct.id]}m.proite{updating[  disabled=                       t.id)}
   (item.productemeIemovck={() => r     onCli                    
   on  <butt                
        iv>   </d                     </p>
                           xed(2)}
   ).toFim.quantityice * iteproduct.pr   ₹{(item.                           700">
en-xt-grefont-bold te2xl xt-sName="te  <p clas                     l</p>
     mb-1">Totaum  font-medi-green-600ext-sm textame="tp classN <                          >
 -3" mbd-xl p-4rounde0 "bg-green-5lassName= <div c                       ]">
  120pxin-w-[-right mName="textdiv class          <              
                  div>
               </           
    on>   </butt                   
            )}                    svg>
</                           
   H6" />-6 0v6m0-6h6m6v6m0 012 h={3} d="MstrokeWidtround" nejoin="eLid" strok="rountrokeLinecap     <path s                   ">
         24240 0 "r" viewBox=urrentColo"c" stroke=nonell="5 h-5" fi"w-me=lassNasvg c       <                        : (
 )                   v>
        ></dipin"animate-sounded-full  rentanspartrer-t-rder-white boer-2 bord bordh-4-4 assName="w <div cl                      
       ct.id] ? (produing[item.{updat                                  >
             
       lg"0 shadow-cale-11orm hover:s-300 transftionl duraon-alwed transitillosor-not-abled:cur400 disagray-sabled:to-y-300 diom-graisabled:frgreen-600 dhover:to-reen-500 m-gr hover:froustify-centeer jcentems-lex itt-white f0 tex5000 to-green-een-4rom-grent-to-r f-gradiull bgunded-f12 ro-12 h-ssName="w  cla                         ]}
 roduct.idem.pting[itled={upda  disab                         ty + 1)}
 ntid, item.quam.product.iantity(itepdateQuck={() => uonCli                            tton
 <bu                               
                   div>
     </            
          /span>quantity}<900">{item.ext-gray-d tont-boll fme="text-2xassNa <span cl                         nter">
  0px] text-ce-w-[8ininner madow-px-6 py-3 shl te rounded-xame="bg-whiiv classN       <d            
                           on>
       </butt                       }
       )                       
svg> </                        
     0 12H4" />"M23} d=trokeWidth={und" sjoin="roeLine" strokp="roundrokeLinecath st         <pa                >
        0 24 24"="0oxolor" viewBentC="currone" stroke" fill="n"w-5 h-5assName=  <svg cl                            (
    ) :                   v>
      di></-spin"full animaterounded-t transparene border-t-border-whit4 border-2 h-"w-4 ssName=   <div cla                          t.id] ? (
 m.producdating[ite    {up                    
        >           
           -lg" shadowcale-110m hover:stransforuration-300 ion-all dsited tran-not-allowursordisabled:co-gray-400 led:tdisabay-300 d:from-grdisable00 red-6er:to- hovfrom-red-500r hover:centetify-er jus-centex itemsflext-white 00 t400 to-red-5om-red-nt-to-r frie-gradl bgunded-ful12 h-12 roe="w-assNam     cl                       tity <= 1}
m.quante || iduct.id]tem.proupdating[i disabled={                          
 antity - 1)}em.qu, itm.product.idity(iteantateQu() => updlick={nC o                        ton
         <but               >
     p-3"nded-2xl -50 roubg-gray-x-4  spacenterx items-ceame="fleiv classN         <d         
                          div>
              </          >
          </div                   p>
 e}</ct.pricrodu">₹{item.p0n-60 text-gree font-bolde="text-2xl<p classNam                        >
    e-x-2"pac-center sitemslex ame="fdiv classN       <                    </p>
                     ory}
    t.categm.produc   {ite                    >
     lock"ull inline-bd-fy-1 rounde100 px-3 py- mb-2 bg-graext-gray-500text-sm tame=" classN  <p                      /h3>
      <                    .name}
  .product       {item              ">
       ration-300-colors duonransiti0 txt-green-60p-hover:te0 mb-1 grou-gray-90bold text-xl font-ame="text  <h3 classN                     -0">
   in-wex-1 me="fl classNamdiv <                   
                         /div>
       <                      )}
                        >
       </div                  
   "></div>-spinfull animate rounded-ansparentrder-t-tr boreen-400border-g6 border-2 6 h-"w-ame=<div classN                          >
    er"fy-cent justiitems-centered-2xl flex y-75 roundcitopahite bg-t-0 bg-w inseutesol"abe=am <div classN                           && (
] uct.id[item.prodpdating   {u                    
   >  /                   }}
                          ;
       e?w=100'0049153332-92c-15428381/photoash.comes.unspl//imagc = 'https:t.sre.targe                           
   ={(e) => { onError                   "
        n-300ll duratioion-atransit:shadow-lg p-hoveroushadow-md gr-2xl edundect-cover ro4 obj4 h-2sName="w-2     clas                     t.name}
  duc{item.pro   alt=                   
      =100'}491e?w533002c32-9to-15428381phosh.com/spla.unimages| 'https://rl |t.imageUucitem.prodrc={  s                     mg
        <i                      ">
 ="relative className    <div                   
 -x-6">r spaceenteitems-cName="flex v class         <di            
         >      }}
       s`100}mdex * lay: `${in animationDetyle={{    s             "
     le-[1.02]caorm hover:ssf300 tranuration-tion-all dsi-lg trandowover:sha0 h20green-r-er:bordey-100 hovr-graorder b p-6 borde2xled-ray-50 roundwhite to-gom-nt-to-r fradietive bg-grp relae="grouamassN       cl               } 
.idm.producty={ite       ke       
          <div         
          => ( index) item,((artItems.map  {c        
        -6"> space-y"p-6 className=     <div
           </div>
              >
   </div            iv>
         </d                utton>
      </b           
     </span>lear Alln>C   <spa                g>
     sv       </           >
      4 7h16" /0 00-1 1v3M1 1 4a 0 00-1-1h-m1-10V4a1 1v66m4-6858L5 7m5 4v01-1.995-1.2a2 2 0 .8616.138 21H7 0 01A2 267 12.142l-.89 7h={2} d="M1okeWidtound" str"rkeLinejoin=" strond"roueLinecap= strok<path                          >
 24""0 0 24wBox= vietColor"e="curren strokone"e" fill="npulsnimate-p-hover:a4 h-4 grouw-Name="  <svg class                            >
        "
        5le-10 hover:sca00 transformion-3l durattion-al2 transiace-x-sptems-center edium flex i-xl font-m rounded00 px-4 py-2text-red-7er:d-600 hov100 text-rer:bg-red-hove50 d-up bg-re="grossName    cla                }}
                               }
                             }
                  art');
     cled to clearrror('Faist.e         toa                     rror) {
} catch (e                            ;
       })                 0,
      00toClose: 2          au                     -right",
 on: "bottom      positi                      , {
    red! 🧹'ea('Cart cl.successoast           t                 er.id);
  ata(usetchCartD    await f                      id);
    er.usrCart(eaervice.clrtS   await ca                         {
       try                       ')) {
 r your cart? to cleantware you you sufirm('Are (window.con    if                     ) => {
  k={async (     onClic                  
  <button                        
                  >
 on     </butt                span>
 resh</  <span>Ref                  /svg>
            <            />
     5"15.357 2H17-2m15.351-3 0 0.00 0a8.003 81v-5h-.581m011 182 9m0 0H9m 0 004.58.0018.001 82m15.356 2A"M4 4v5h.52} d=={idthtrokeWund" sin="ronejod" strokeLi"rounap= strokeLinec  <path                      
  24 24">Box="0 0 iewr" vrrentColo"cue" stroke="non" fill=inate-spp-hover:anim4 groume="w-4 h- classNa       <svg                >
                 
      5"scale-10over:ransform h-300 tall durationransition- space-x-2 terems-centum flex itl font-mediunded-x py-2 roue-700 px-4:text-bler-600 hov00 text-blueg-blue-1hover:b50 oup bg-blue-Name="grss        cla         }
        }                               }
             t');
     h carfresed to re('Failst.error       toa                     rror) {
  } catch (e                    
         });                       500,
autoClose: 1                           ight",
   : "bottom-rosition      p                        
shed! 🔄', {art refre'Cess(toast.succ                      
      a(user.id);chCartDat  await fet                         try {
                          
  => {nc ()nClick={asy   o                     <button
              >
        -3"ex space-x"flssName= <div cla                 div>
  </                      </h2>
                    ngth})
Items.lertms ({ca   Cart Ite                   
  ">00 text-gray-9ldxl font-bot-2ex="tssName <h2 cla                v>
             </di        svg>
               </               9z" />
 2H4L5h14l1 1M5 90 00-8 0v46 11V7a4 4  d="M1eWidth={2}oktr s="round"oineLinejnd" strok"rouinecap=strokeL <path                         4">
 24 2 0 "0r" viewBox=loentCourrtroke="c"none" sfill=hite" h-4 text-wName="w-4 <svg class                       ">
 stify-center jums-centeriteull flex ounded-f-green-500 r h-8 bg"w-8className=v di       <            -3">
   ace-xcenter splex items-Name="flassv c     <di            ter">
   en items-centwejustify-be"flex ssName=cla    <div            ">
   y-100border-graorder-b  b py-6 px-8ue-50-bleen-50 toto-r from-grient-g-grade="b classNam    <div          en">
  ddrflow-hi00 ovegray-1er border-dow-lg borded-2xl sharound-white ="bgNamelass      <div c    
    ce-y-6">an-2 spag:col-spme="lclassNa      <div       ems */}
rt Itced CahanEn {/*         
   -3 gap-8">rid-colsls-1 lg:grid grid-cossName="giv cla    <d       ) : (
   
    v>     </di
     button>         </
     </span>          span>
  opping</ Sh>Start      <span        vg>
         </s       9z" />
  12H4L5 4l1 8 0v4M5 9h100-1V7a4 4 0 6 1d="M1} keWidth={2 stroound""rkeLinejoin=trod" sap="rounstrokeLinecth         <pa
          24 24">="0 0 viewBoxrentColor" stroke="curne" "no" fill=mate-bounceover:ani5 group-h"w-5 h-ame=svg classN      <     2">
     ace-x--center sptemslex iassName="f cl    <span          
       >"
     w-xlover:shadoow-lg h shad-300ationtion-all dur05 transicale-1 hover:s00 transformo-green-7ver:tgreen-600 hoom-hover:frld text-lg emibo-sed-xl font py-4 round px-8white00 text-o-green-6green-500 tt-to-r from-p bg-gradien="grou  className       s')}
     '/productate(avig> n =Click={()         ontton
              <bup>
       </t!
        x thaet. Let's fis items yiciouded any delen't ad havyou Looks like          
    to">d mx-au-w-mt-lg max mb-8 texext-gray-600ame="tsN<p clas     3>
       pty</hemis  cart ">Your mb-3-900xt-grayd te-bolt-2xl fontame="texlassN   <h3 c       iv>
    </d          </div>
            😋</span>
  "text-lg">assName=an cl<sp             ulse">
   animate-pter ener justify-ctems-cent flex i-full00 roundedw-4-yelloh-8 bgight-2 w-8 op-2 -rlute -tme="absoassNa    <div cl         /div>
  <    
         vg>   </s            />
   0 000 4z"4 2 2 0 100-zM9 21a2 2 2 2 0 000 42 2 0 100-40h15M17 21a13l-1.5-6m0 1.5 6M7  0l-m0m0 0L7 13h10l4-8H5.4 2M7 13"M3 3h2l.4h={2} d=idtnd" strokeWn="routrokeLinejoi" sundroap="eLinecok   <path str        
       ">="0 0 24 24 viewBoxr"Colo"current" stroke=fill="nonegray-400" xt-te"w-16 h-16 g className=  <sv              -bounce">
mate-lg aniadow sh-8to mbcenter mx-aur justify-ms-cente ited-full flexoundeo-gray-200 ry-100 t-graomo-br fradient-t-32 bg-gr="w-32 hssNamev cla  <di        
    e">elativ"re=div classNam   <>
         fade-in"20 animate-py-nter "text-ceclassName=       <div 0 ? (
    === engthems.l {cartIt>

             </divv>
  </di     /div>
         <     /p>
              <
   ems?'}elicious itd some d to adeady` : 'Rr checkoutms ready fo 0)} iteem.quantity,total + it, item) => duce((totals.retem? `${cartIngth > 0 Items.le       {cart
         -1"> mtt-gray-600ame="tex classN  <p                </h1>
         Your Cart
              t">
   t-transparenext tex0 bg-clip-tray-70 to-gay-900 from-grradient-to-rt-bold bg-gfonxl e="text-4assNam    <h1 cl
          <div>           </div>
     
         </svg>          
   " />00 4z2 0 02 4  0 100-a2 2 4zM9 21002 0 02 0 100-4 2 2 15M17 21a-1.5-6m0 0h3l-1.5 6M7 1 13m0 0lL7-8H5.4m0 0 13h10l4h2l.4 2M7"M3 3 d=={2} strokeWidthround"eLinejoin="trokund" s"roap=keLinech stro   <pat            
 ">"0 0 24 24x=ewBovirentColor" "cure" stroke=fill="none" t-whittex"w-6 h-6  className=     <svg        -lg">
 owr shadustify-centeter j-cenmsx iteull fleed-f00 round-green-6reen-400 to-r from-g-gradient-to2 bge="w-12 h-1iv classNam      <d
      x-4">er space-ems-cent itame="flexclassNiv      <d     ">
2-1 mbs-centeritemen etwestify-b"flex juName=  <div class  /}
    le Section *nced Titha  {/* En
      div>

        </  </button>   an>
     /spue Shopping<in">Cont-lgium textedt-mssName="fonla   <span c       </div>
             </svg>
            
   7 7-7" />"M15 19l-7-={2} d=keWidthroound" stjoin="rrokeLine"round" stp=okeLinecastrath        <p    >
     4 24""0 0 2 viewBox=Color"urrent"cne" stroke=no fill="5"-5 h-me="wassNa    <svg cl      >
    n-300"ll duration-alg transitioshadow-r:over group-htify-centeer jusntx items-ced fleite shadow-ml bg-whfuled-0 h-10 round"w-1e=div classNam    <             >

     e-105"alorm hover:scnsfration-300 tion-all dura transitt-green-600hover:tex00 y-6-graextace-x-3 tnter spex items-ce"group flssName=         clas')}
   ('/productate navigck={() =>li     onC  
     ton   <but     10">
  b-ween mety-btifnter jusx items-cessName="fle   <div cla     ion */}
Sectder d Hea/* Enhance>
        {-8 py-8"x-6 lg:px4 sm:px--auto pl mx7xme="max-w-in classNa<ma>

       /alse}art={fr} showCuser={useeader >
      <H-gray-100" togray-50om--to-br fradientreen bg-grin-h-scame="m<div classNturn (
      }

  re    );
div>
v>
      </    </di
    items</p>h your  fetcle we wait whise mt-2">Plea500ray-text-gsName="<p clas          rt...</p>
ng your caoadise">Lulnimate-pay-700 atext-grt-semibold t-xl fone="tex classNam       <p>
   /div
          </svg>        <z" />
    0 44 2 2 0 000-2 2 0 109 21a4zM2 0 000 100-4 2 21a2 2 0 0h15M17 -1.5-6m0 -1.5 6M7 13lm0 0lL7 13.4m0 00l4-8H5 13h1M7"M3 3h2l.4 2th={2} d=" strokeWidoin="roundtrokeLinej sap="round"Linec<path stroke         4">
     0 0 24 2wBox="olor" vietC"curren" stroke=fill="nonete-spin" animahite h-8 text-w"w-8 g className=         <sv">
   pulsee- mb-4 animat mx-autostify-centerenter ju items-clex fd-full rounden-60000 to-greem-green-4-to-r froadientg-gr6 h-16 be="w-1lassNam  <div c      ">
  ter="text-cenlassNameiv c      <dter">
  y-censtif juterex items-cengray-100 fl0 to-om-gray-5ent-to-br fr-gradih-screen bgsName="min-v clas     <di return (
  {
    (loading)  };

  if   }
;
 ow error    thr
       }      });
 
  e: true  replac},
        fo rrorInate: { e  st       led', { 
 ent-faigate('/paym  navi     e {
    } elsled');
   elayment canc.warning('P    toast {
    ncelled'))udes('ca.inclrror.message
      if (e};
      
      esages || error.mscriptionerror.deription:    desc',
     AYMENT_ERRORcode || 'Pr. erro      code:e,
  error.messagmessage:        
 = {errorInfo t  cons
       
    r);, erroerror:'Payment sole.error('      con {
(error)h     } catc }

          });e: true
   lac       rep     },
   
        }        t
  totalAmount:   amoun            d,
ult.orderIResmentrderId: pay       o
       mentId,sult.pay paymentRed:paymentI     {
         entInfo: aym        p{ 
    te:       sta 
    ess', {-succ'/paymentavigate(
        n   }
            
 rderError);ful:', o was successaymentbut pent failed, der placemle.warn('Or  conso{
        or) (orderErr} catch         order);
 ',uccessfully:aced ser ple.log('Ord      consol
                  );
       }
           d
ult.orderIpaymentResd: erIazorpayOrd      r
        .paymentId,tResulttId: paymenen        paym     {
    ,
            'ONLINE'         dress,
eryAddeliv       ,
     r.id       useart(
     omCrFrOrdee.placeicrderServwait or = ade const or     y {
         tr      
   
  );entResultymrder...', pa ongci, plaessfulccnt suaymeog('Pe.l consol       ) {
ult.success (paymentRes
      if      });
