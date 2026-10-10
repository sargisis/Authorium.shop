import React from 'react';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo.png"
            alt="Authorium"
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              boxShadow: '0 0 50px rgba(255, 200, 0, 0.45)',
              animation: 'fadeUp 0.8s ease-out',
            }}
          />
        </div>
        <h1>
          Բացահայտիր <span>քո հաջորդ</span> գիրքը
        </h1>
        <p>
          Ամենամեծ հայերեն գրքերի էլեկտրոնային հարթակը Telegram-ում: 
          Գնիր մեկ անգամ, կարդա անմիջապես քո սիրելի մեսենջերում՝ առանց հավելյալ հավելվածների:
        </p>
        <a href="https://t.me/authorium_shop_bot" target="_blank" rel="noreferrer" className="cta-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 5L2 12.5L9 13.5M21 5L18.5 20L9 13.5M21 5L9 13.5M9 13.5V19L12 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Անցնել Խանութ
        </a>
      </section>

      <section className="features">
        <div className="glass-card">
          <h3>Ակնթարթային Մուտք</h3>
          <p>Անմիջապես վճարումից հետո գիրքը հասանելի է դառնում քո Telegram հաշվում: Չկան սպասումներ և առաքման խնդիրներ:</p>
        </div>
        <div className="glass-card">
          <h3>Անվտանգ Վճարումներ</h3>
          <p>Մենք ընդունում ենք ArCa, Visa և MasterCard: Բոլոր գործարքները պաշտպանված են 3D Secure 2.0 համակարգով:</p>
        </div>
        <div className="glass-card">
          <h3>Հարմարավետ Ընթերցանություն</h3>
          <p>Կարդա հենց Telegram-ի ներսում: Մեր հատուկ նախագծված ընթերցիչը ապահովում է լավագույն փորձը ցանկացած սարքում:</p>
        </div>
      </section>
    </>
  );
}
