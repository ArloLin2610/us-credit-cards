from lib import *
B = 'https://www.usbank.com/credit-cards/'
A = 'https://www.usbank.com/content/dam/usbank/en/images/illustrations/card-art/credit-cards/'
CP = [('choice', 5, 'two categories you choose each quarter', '每季自選兩個類別', dict(cap=('first $2,000 in combined purchases per quarter, then 1%; quarterly enrollment required', '每季合計前 $2,000，之後 1%；需每季登錄'))),
      ('portal', 5, 'prepaid air, hotel and car reservations booked in the Travel Center', '於 Travel Center 預付訂購機票、飯店與租車'),
      ('groceries', 2, 'one everyday category you choose each quarter (e.g. grocery stores, gas/EV charging, restaurants)', '每季自選一個日常類別（如超市、加油／充電、餐廳）'), ('all', 1)]
GO = [('dining', 4, 'dining, takeout and restaurant delivery', '餐飲、外帶與外送', dict(cap=('first $2,000 each quarter', '每季前 $2,000'))),
      ('groceries', 2, 'grocery stores and gas/EV charging stations (excludes discount stores/supercenters and wholesale clubs)', '超市與加油／充電站（不含量販店與會員制賣場）'),
      ('streaming', 2, 'streaming services', '串流服務'), ('all', 1)]
SEC = ('Refundable security deposit of $300–$5,000 sets your credit limit', '可退還保證金 $300–$5,000，即為信用額度')
cards = [
    card('usbank-smartly', 'U.S. Bank Smartly™ Visa Signature® Card', 'visa', 0, 'cashback', 'cash', [('all', 2)],
         B + 'bank-smartly-visa-signature-credit-card.html', A + 'photo-bank-smartly-card-art.png', intro=(12, 'both'),
         hl=[('Up to an additional 2% on the first $10,000 per billing cycle with qualifying U.S. Bank Smartly® Savings/Checking balances (2.5% total from $10,000, 3% from $50,000, 4% from $100,000)', '持有 U.S. Bank Smartly® 存款達門檻，每期前 $10,000 最高再加 2%（$10,000 起共 2.5%、$50,000 起 3%、$100,000 起 4%）')]),
    card('usbank-shield', 'U.S. Bank Shield® Visa® Card', 'visa', 0, 'cashback', 'cash',
         [('portal', 4, 'prepaid air, hotel and car reservations booked in the Travel Center', '於 Travel Center 預付訂購機票、飯店與租車')],
         B + 'shield-visa-credit-card.html', A + 'shield-credit-card-transparent.png', intro=(21, 'both'),
         hl=[('0% intro APR for the first 21 billing cycles on purchases and balance transfers', '消費與餘額代償前 21 期帳單 0% 優惠利率'), ('No everyday rewards outside the Travel Center', '除 Travel Center 外無一般消費回饋')]),
    card('usbank-cash-plus', 'U.S. Bank Cash+® Visa Signature® Card', 'visa', 0, 'cashback', 'cash', CP,
         B + 'cash-plus-visa-signature-credit-card.html', A + 'photo-cash-plus-signature-lg.png', intro=(15, 'both'),
         welcome=dict(value=200, unit='usd', spend=1000, months=3)),
    card('usbank-altitude-connect', 'U.S. Bank Altitude® Connect Visa Signature® Card', 'visa', 0, 'points', 'usbank-altitude',
         [('portal', 5, 'prepaid hotels and car rentals booked in the Travel Center', '於 Travel Center 預付訂購飯店與租車'), ('travel', 4),
          ('gas', 4, 'gas stations and EV charging stations', '加油站與電動車充電站', dict(cap=('first $1,000 each quarter', '每季前 $1,000'))),
          ('dining', 2, 'dining, streaming services and grocery stores', '餐飲、串流服務與超市'), ('all', 1)],
         B + 'altitude-connect-visa-signature-credit-card.html', A + 'photo-altitude-connect-consumer.png', fx=0, intro=(15, 'both'), tags=['lounge'],
         welcome=dict(value=20000, unit='points', spend=1000, months=3),
         hl=[('Airport lounge access benefit and TSA PreCheck® statement credits (see issuer page for limits)', '機場貴賓室禮遇與 TSA PreCheck® 回饋（限制見官網）')]),
    card('usbank-altitude-go', 'U.S. Bank Altitude® Go Visa Signature® Card', 'visa', 0, 'points', 'usbank-altitude', GO,
         B + 'altitude-go-visa-signature-credit-card.html', A + 'altitude-go-visa-signature-credit-card.png', intro=(15, 'both'),
         welcome=dict(value=20000, unit='points', spend=1000, months=3), hl=[('$15 credit for annual streaming service purchases', '年度串流服務消費回饋 $15')]),
    card('usbank-altitude-go-secured', 'U.S. Bank Altitude® Go Secured Visa® Card', 'visa', 0, 'points', 'usbank-altitude', GO,
         B + 'altitude-go-secured-visa-credit-card.html', A + 'altitude-go-secured-credit-card.png', tags=['credit-building', 'secured'], hl=[SEC]),
    card('usbank-cash-plus-secured', 'U.S. Bank Cash+® Secured Visa® Card', 'visa', 0, 'cashback', 'cash', CP,
         B + 'cash-plus-secured-visa-credit-card.html', A + 'cash-plus-secured-lg.png', tags=['credit-building', 'secured'], hl=[SEC]),
    card('usbank-secured', 'U.S. Bank Secured Visa® Card', 'visa', 0, 'cashback', 'cash', [],
         B + 'secured-visa-credit-card.html', A + 'photo-classic-secured-visa-vertical-2x3.png', tags=['credit-building', 'secured', 'no-rewards'],
         hl=[SEC, ('No rewards program', '無回饋計畫')]),
]
write('usbank', cards)
