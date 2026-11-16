from lib import *
B = 'https://www.discover.com/credit-cards/'
A = 'https://ecm.capitalone.com/WCM/dfs-card/products/'
ROT = ('rotating', 5, 'everyday purchases at different places each quarter', '每季不同的日常消費通路', dict(cap=('up to the quarterly maximum; activation required', '每季有上限，需每季啟用')))
MATCH = ('Unlimited Cashback Match: all cash back earned in the first year is matched dollar-for-dollar', 'Cashback Match：首年賺得的現金回饋全額加倍，無上限')
CHR = [('gas', 2, 'gas stations and restaurants', '加油站與餐廳', dict(cap=('up to $1,000 in combined purchases each quarter', '每季合計上限 $1,000'))), ('all', 1)]
cards = [
    card('discover-it-cash-back', 'Discover it® Cash Back Credit Card', 'discover', 0, 'cashback', 'cash', [ROT, ('all', 1)],
         B + 'cash-back/it-card/', A + 'itblue_card/rdesktop.png', welcome=dict(value=200, unit='usd', spend=500, months=3), hl=[MATCH]),
    card('discover-it-chrome', 'Discover it® Chrome Gas & Restaurants Credit Card', 'discover', 0, 'cashback', 'cash', CHR,
         B + 'cash-back/chrome/', A + 'itchrome_card/rdesktop.png', hl=[MATCH]),
    card('discover-it-miles', 'Discover it® Miles Credit Card', 'discover', 0, 'miles', 'discover-miles', [('all', 1.5)],
         B + 'travel/', A + 'itmiles_card/rdesktop.png',
         hl=[('Unlimited Discover Match: all miles earned in the first year are matched', 'Discover Match：首年賺得的哩程全額加倍，無上限'),
             ('Miles are a fixed-value currency redeemed as travel credits or cash, not airline miles', '哩程為固定價值，可折抵旅遊消費或兌現，並非航空公司哩程')]),
    card('discover-it-balance-transfer', 'Discover it® Balance Transfer Credit Card', 'discover', 0, 'cashback', 'cash', [ROT, ('all', 1)],
         B + 'balance-transfer-credit-cards/cash-back-bt-card/', A + 'it-card/rdesktop.png', intro=(18, 'bt'),
         hl=[('0% intro APR for 18 months on balance transfers and 6 months on purchases', '餘額代償 18 個月、消費 6 個月 0% 優惠利率'), MATCH]),
    card('discover-it-student-cash-back', 'Discover it® Student Cash Back Credit Card', 'discover', 0, 'cashback', 'cash', [ROT, ('all', 1)],
         B + 'student-credit-card/it-card/', A + 'itiridescent_card/rdesktop.png', tags=['student'], hl=[MATCH]),
    card('discover-it-student-chrome', 'Discover it® Student Chrome Credit Card', 'discover', 0, 'cashback', 'cash', CHR,
         B + 'student-credit-card/chrome-card/', A + 'itchrome_card/rdesktop.png', tags=['student'], hl=[MATCH]),
    card('discover-it-secured', 'Discover it® Secured Cash Back Credit Card', 'discover', 0, 'cashback', 'cash', [ROT, ('all', 1)],
         B + 'secured-credit-card/', A + 'itblue_card/rdesktop.png', tags=['credit-building', 'secured'],
         hl=[('Refundable deposits as low as $49 unlock credit lines starting at $200', '可退還保證金最低 $49，額度 $200 起'), MATCH]),
    card('discover-it-nhl', 'NHL® Discover it® Credit Card', 'discover', 0, 'cashback', 'cash', [ROT, ('all', 1)],
         B + 'cash-back/nhl-card/', A + 'itnhlshield_card/rdesktop.png', hl=[('Card designs for all 32 NHL® teams', '32 支 NHL® 球隊卡面可選'), MATCH]),
]
write('discover', cards)
