import React from 'react';

export default function ContactPage() {
  return (
    <div className="legal-page">
      <h1>Կապ մեզ հետ</h1>
      <p className="last-updated">Վերջին թարմացում՝ Հոկտեմբեր 2026</p>

      <div className="legal-content">
        <p>
          Authorium.store-ը Հայաստանի հայերեն գրքերի առցանց խանութ է, որտեղ կարող եք գտնել էլեկտրոնային գրքեր և ընթերցել դրանք անմիջապես Telegram-ում։
        </p>

        <h2>Հիմնական կապեր</h2>
        <ul>
          <li><b>Telegram բոտ (24/7):</b> <a href="https://t.me/authorium_shop_bot" target="_blank" rel="noreferrer" style={{color: 'var(--primary)'}}>@authorium_shop_bot</a></li>
          <li><b>Էլեկտրոնային փոստ:</b> <a href="mailto:info@authorium.store" style={{color: 'var(--primary)'}}>info@authorium.store</a></li>
        </ul>

        <h2>Աշխատանքային ժամեր և պայմաններ</h2>
        <ul>
          <li>Աշխատանքային օրեր՝ Երկուշաբթի – Ուրբաթ</li>
          <li>Ժամեր՝ 10:00 – 19:00 (Երևանի ժամանակով)</li>
          <li>Նամակների պատասխան՝ 1–3 աշխատանքային ժամվա ընթացքում</li>
        </ul>

        <h2>Իրավական տվյալներ (Ռեկվիզիտներ)</h2>
        <div style={{ padding: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', marginTop: '1rem' }}>
          <p><b>Իրավաբանական Անձ՝</b> Ա/Ձ Գոռ Բաղդասարյան</p>
          <p><b>ՀՎՀՀ (TIN)՝</b> 12345678 (լրացնել ձեր ՀՎՀՀ-ն)</p>
          <p><b>Իրավաբանական հասցե՝</b> ՀՀ, Երևան, Փողոց 1, շենք 2 (լրացնել իրական հասցեն)</p>
          <p><b>Բանկ՝</b> Ամերիաբանկ ՓԲԸ</p>
        </div>
      </div>
    </div>
  );
}
