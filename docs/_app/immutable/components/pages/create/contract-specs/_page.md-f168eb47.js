import{S as E,i as L,s as P,k,q as y,a as v,l as r,m,r as x,h as s,c as _,n as H,b as e,G as b,B as w}from"../../../../chunks/index-76eb94c0.js";function V(g){let t,h,u,p,A=`<code class="language-javascript">pragma cashscript <span class="token operator">>=</span> <span class="token number">0.7</span><span class="token number">.1</span><span class="token punctuation">;</span>


<span class="token comment">// Pay equal payments at regular intervals using input locks</span>
contract <span class="token function">Annuity</span><span class="token punctuation">(</span>

    <span class="token comment">// interval for payouts, in blocks</span>
    int period<span class="token punctuation">,</span>

    <span class="token comment">// LockingBytecode of the beneficiary, the address receiving payments</span>
    bytes recipientLockingBytecode<span class="token punctuation">,</span>

    <span class="token comment">// amount paid in each installment</span>
    int installment<span class="token punctuation">,</span>

    <span class="token comment">// extra allowance for administration of contract</span>
    <span class="token comment">// fees are paid from executors' allowance.</span>
    int executorAllowance
<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
    <span class="token keyword">function</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>

        <span class="token comment">// Check that the first output sends to the recipient</span>
        <span class="token function">require</span><span class="token punctuation">(</span>tx<span class="token punctuation">.</span>outputs<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>lockingBytecode <span class="token operator">==</span> recipientLockingBytecode<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Check that time has passed and that time locks are enabled</span>
        <span class="token function">require</span><span class="token punctuation">(</span>tx<span class="token punctuation">.</span>age <span class="token operator">>=</span> period<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// require the second output to match the active bytecode</span>
        <span class="token function">require</span><span class="token punctuation">(</span>tx<span class="token punctuation">.</span>outputs<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">.</span>lockingBytecode <span class="token operator">==</span> <span class="token keyword">new</span> <span class="token class-name">LockingBytecodeP2SH</span><span class="token punctuation">(</span><span class="token function">hash160</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>activeBytecode<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Get the total value on the contract</span>
        int currentValue <span class="token operator">=</span> tx<span class="token punctuation">.</span>inputs<span class="token punctuation">[</span><span class="token keyword">this</span><span class="token punctuation">.</span>activeInputIndex<span class="token punctuation">]</span><span class="token punctuation">.</span>value<span class="token punctuation">;</span>

        <span class="token comment">// Calculate value returned to the contract</span>
        int returnedValue <span class="token operator">=</span> currentValue <span class="token operator">-</span> installment <span class="token operator">-</span> executorAllowance<span class="token punctuation">;</span>

        <span class="token comment">// Check that the outputs send the correct amounts</span>
        <span class="token function">require</span><span class="token punctuation">(</span>tx<span class="token punctuation">.</span>outputs<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>value <span class="token operator">>=</span> installment<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">require</span><span class="token punctuation">(</span>tx<span class="token punctuation">.</span>outputs<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">.</span>value <span class="token operator">>=</span> returnedValue<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token punctuation">&#125;</span>

<span class="token punctuation">&#125;</span></code>`,l,o,f,i,c,d;return{c(){t=k("h1"),h=y("Annuity"),u=v(),p=k("pre"),l=v(),o=k("h1"),f=y("Test"),i=v(),c=k("p"),d=y("this is a link test"),this.h()},l(n){t=r(n,"H1",{});var a=m(t);h=x(a,"Annuity"),a.forEach(s),u=_(n),p=r(n,"PRE",{class:!0});var C=m(p);C.forEach(s),l=_(n),o=r(n,"H1",{});var q=m(o);f=x(q,"Test"),q.forEach(s),i=_(n),c=r(n,"P",{});var B=m(c);d=x(B,"this is a link test"),B.forEach(s),this.h()},h(){H(p,"class","language-javascript")},m(n,a){e(n,t,a),b(t,h),e(n,u,a),e(n,p,a),p.innerHTML=A,e(n,l,a),e(n,o,a),b(o,f),e(n,i,a),e(n,c,a),b(c,d)},p:w,i:w,o:w,d(n){n&&s(t),n&&s(u),n&&s(p),n&&s(l),n&&s(o),n&&s(i),n&&s(c)}}}class T extends E{constructor(t){super(),L(this,t,null,V,P,{})}}export{T as default};
//# sourceMappingURL=_page.md-f168eb47.js.map
