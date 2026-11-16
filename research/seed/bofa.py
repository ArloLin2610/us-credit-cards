from lib import *
B = 'https://www.bankofamerica.com/credit-cards/products/'
A = 'https://www.bankofamerica.com/content/images/ContextualSiteGraphics/CreditCardArt/en_US/Approved_PCM/'
N = 'Bank of America product pages are ZIP-code gated and built in the browser; only the page summary was readable. Summary: '
def c(slug, id, name, network, rtype, program, summary, img, tags=()):
    return card('bofa-' + id, name, network, 0, rtype, program, [], B + slug + '/', A + img, tags=tags, review=True, notes=N + summary,
                hl=[('Details pending manual verification on the issuer site', '詳細權益待人工至官網核對')])
cards = [
    c('cash-back-credit-card', 'customized-cash', 'Bank of America® Customized Cash Rewards Credit Card', 'visa', 'cashback', 'cash',
      'earn 6% cash back in the category of your choice for the first year; $200 cash rewards bonus offer.', '8ckn_cshsigcm_v_250x158.png'),
    c('unlimited-cash-back-credit-card', 'unlimited-cash', 'Bank of America® Unlimited Cash Rewards Credit Card', 'visa', 'cashback', 'cash',
      'unlimited 2% cash back on all purchases for the first year from account opening; $200 online cash rewards bonus offer.', '8cty_cshsigcm_v_250x157.png'),
    c('travel-rewards-credit-card', 'travel-rewards', 'Bank of America® Travel Rewards Credit Card', 'visa', 'points', 'bofa-points',
      'unlimited 1.5 points per $1 on all purchases; points do not expire while the account is open.', '8blm_trvsigcm_v_250x158.png'),
    c('premium-rewards-credit-card', 'premium-rewards', 'Bank of America® Premium Rewards® Credit Card', 'visa', 'points', 'bofa-points',
      'unlimited points, up to $200 in travel statement credits, and a bonus points offer.', '8CAL_prmsigcm_v_250_158.png'),
    c('premium-rewards-elite-credit-card', 'premium-rewards-elite', 'Bank of America® Premium Rewards® Elite Credit Card', 'visa', 'points', 'bofa-points',
      'redeem points for travel, cash back, statement credit, experiences or gift cards.', '8cud_premrewelite_v_250x158.png'),
    c('bankamericard-credit-card', 'bankamericard', 'BankAmericard® Credit Card', 'mastercard', 'cashback', 'cash',
      'low introductory APR offer on purchases and qualifying balance transfers.', '8cae_nrwcm_mc_250x158.png', tags=['no-rewards']),
    c('secured-credit-card', 'bankamericard-secured', 'BankAmericard® Secured Credit Card', 'mastercard', 'cashback', 'cash',
      'secured card for building credit; free monthly FICO® Score.', '8cae_nrwcm_mc_250x158.png', tags=['credit-building', 'secured', 'no-rewards']),
    c('unlimited-cash-back-secured-credit-card', 'unlimited-cash-secured', 'Bank of America® Unlimited Cash Rewards Secured Credit Card', 'visa', 'cashback', 'cash',
      '(page summary appears to describe the student version) unlimited cash back; verify.', '8cty_cshcm_v_250x157.png', tags=['credit-building', 'secured']),
    c('student-cash-back-credit-card', 'customized-cash-student', 'Bank of America® Customized Cash Rewards Credit Card for Students', 'visa', 'cashback', 'cash',
      'earn 6% cash back in the category of your choice for the first year; $200 cash rewards bonus offer.', '8ckn_cshsigcm_v_250x158.png', tags=['student']),
    c('alaska-airlines-credit-card', 'atmos-ascent', 'Atmos™ Rewards Ascent Visa Signature® Credit Card', 'visa', 'miles', 'atmos',
      'earn Atmos Rewards points for travel on Alaska Airlines; companion fare.', '1bbt_sigcm_v_atmos_ascent_250.png'),
    c('allegiant-credit-card', 'allways-rewards', 'Allegiant Allways Rewards Visa® Credit Card', 'visa', 'miles', 'allegiant',
      'bonus points after qualifying purchases in the first 90 days.', 'ragp_sigcm_v_250.png'),
    c('travel-rewards-secured-credit-card', 'travel-rewards-secured', 'Bank of America® Travel Rewards Secured Credit Card', 'visa', 'points', 'bofa-points',
      'earn travel rewards while building credit.', '8blm_trvcm_v_250x158.png', tags=['credit-building', 'secured']),
]
write('bofa', cards)
