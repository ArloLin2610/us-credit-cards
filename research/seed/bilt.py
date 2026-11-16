from lib import *
S = 'https://www.bilt.com/card'
HOUSING = ('rent', None, 'rent and mortgage payments: 0.5X–1.25X depending on everyday card spend that billing cycle (250 points if spend is under 25% of the housing payment)', '房租與房貸：0.5X–1.25X，依當期日常刷卡金額占房租比例而定（未達 25% 則為 250 點）')
def housing():
    return ('rent', 1.25, HOUSING[2], HOUSING[3])
COMMON = [('No transaction fee on rent and mortgage payments made through Bilt', '經 Bilt 繳房租與房貸免手續費'), 'transfer']
cards = [
    card('bilt-blue', 'Bilt Blue Card', 'mastercard', 0, 'points', 'bilt',
         [('dining', 4, 'Bilt partner restaurants (up to 4X)', 'Bilt 合作餐廳（最高 4X）'), ('portal', 3, 'hotels booked on the Bilt Travel Portal', '於 Bilt Travel Portal 訂飯店'),
          ('flights', 2, 'flights booked on the Bilt Travel Portal', '於 Bilt Travel Portal 訂機票'), housing(), ('all', 1)],
         S, fx=0, welcome=dict(text=('$100 Bilt Cash', '$100 Bilt Cash')), hl=COMMON + ['cell']),
    card('bilt-obsidian', 'Bilt Obsidian Card', 'mastercard', 95, 'points', 'bilt',
         [('dining', 6, 'Bilt partner restaurants (up to 6X)', 'Bilt 合作餐廳（最高 6X）'), ('portal', 4, 'hotels booked on the Bilt Travel Portal', '於 Bilt Travel Portal 訂飯店'),
          ('choice', 3, 'your choice of dining or grocery', '餐飲或超市二擇一', dict(cap=('grocery up to $25,000 per year', '超市每年上限 $25,000'))),
          ('flights', 3, 'flights booked on the Bilt Travel Portal', '於 Bilt Travel Portal 訂機票'), ('travel', 2, 'other travel', '其他旅遊消費'), housing(), ('all', 1)],
         S, fx=0, welcome=dict(text=('$200 Bilt Cash', '$200 Bilt Cash')),
         hl=COMMON + [('$100 annual Bilt Travel hotel credit (two $50 statement credits)', '每年 $100 Bilt Travel 飯店回饋（分兩次各 $50）')]),
    card('bilt-palladium', 'Bilt Palladium Card', 'mastercard', 495, 'points', 'bilt',
         [('dining', 5, 'Bilt partner restaurants (up to 5X)', 'Bilt 合作餐廳（最高 5X）'), ('portal', 4, 'hotels booked on the Bilt Travel Portal', '於 Bilt Travel Portal 訂飯店'),
          ('flights', 3, 'flights booked on the Bilt Travel Portal', '於 Bilt Travel Portal 訂機票'), housing(), ('all', 2, 'other travel and everyday purchases', '其他旅遊與日常消費')],
         S, fx=0, tags=['lounge'],
         welcome=dict(value=50000, unit='points', spend=4000, months=3, extra=('plus $300 Bilt Cash and Gold status; spend excludes rent and mortgage (first 90 days)', '另贈 $300 Bilt Cash 與 Gold 會籍；消費門檻不含房租房貸（開卡 90 天內）')),
         hl=COMMON + [('$400 annual Bilt Travel hotel credit (two $200 statement credits)', '每年 $400 Bilt Travel 飯店回饋（分兩次各 $200）'), 'pp']),
]
write('bilt', cards)
