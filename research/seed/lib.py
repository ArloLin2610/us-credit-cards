"""One-time seeding helpers. After seeding, data/cards/<issuer>.json is the source of truth."""
import json, os, re
TODAY = '2026-11-16'
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')

# frequently used highlights (en, zh)
HL = {
 'bag1': ('First checked bag free', '免費託運第一件行李'),
 'bag2': ('First and second checked bags free', '免費託運第一、二件行李'),
 'ge': ('Up to $120 Global Entry / TSA PreCheck® fee credit', 'Global Entry／TSA PreCheck® 申請費回饋最高 $120'),
 'pp': ('Priority Pass™ airport lounge access', 'Priority Pass™ 機場貴賓室'),
 'combine_ur': ('Points can be combined with a Sapphire card and transferred to airline/hotel partners', '點數可合併到 Sapphire 卡後轉點至航空／飯店夥伴'),
 'transfer': ('Points transfer to airline and hotel partners', '點數可轉至航空與飯店夥伴'),
 'noexp': ('Rewards do not expire while the account is open', '帳戶有效期間回饋不會過期'),
 'credit': ('Designed for building credit', '適合建立信用紀錄'),
 'cell': ('Cell phone protection when you pay your bill with the card', '以本卡繳電話費享手機保障'),
}

def L(en, zh):
    return {'en': en, 'zh': zh}

def _hl(h):
    if isinstance(h, str):
        return L(*HL[h])
    return L(*h)

def card(id, name, network, fee, rtype, program, rewards, src, img=None, welcome=None, hl=(), fx=None,
         intro=None, tags=(), first_year=None, fee_note=None, apply=None, status='active', status_note=None,
         unit=None, notes=None, review=False):
    """rewards: list of (cat, rate[, detail_en, detail_zh[, opts]]); opts: cap=(en,zh), until='YYYY-MM-DD', featured=True
    welcome: dict(value=, unit='points|miles|usd|nights', spend=, months=, extra=(en,zh), text=(en,zh), limited=bool)
    intro: (months, 'purchases'|'both'|'bt')"""
    issuer = id.split('-')[0]
    c = {'id': id, 'issuer': issuer, 'name': name, 'network': network,
         'annual_fee': {'amount': fee}}
    if first_year is not None: c['annual_fee']['first_year'] = first_year
    if fee_note: c['annual_fee']['note'] = L(*fee_note)
    c['reward_type'] = rtype
    c['program'] = program
    c['earn_unit'] = unit or ('pct' if rtype == 'cashback' else 'x')
    rs = []
    for r in rewards:
        e = {'cat': r[0], 'rate': r[1]}
        if len(r) > 3 and r[2]: e['detail'] = L(r[2], r[3])
        opts = r[4] if len(r) > 4 else {}
        if 'cap' in opts: e['cap'] = L(*opts['cap'])
        if 'until' in opts: e['valid_until'] = opts['until']
        if opts.get('featured'): e['featured'] = True
        rs.append(e)
    c['rewards'] = rs
    if welcome:
        w = {}
        for k in ('value', 'unit', 'spend', 'months'):
            if k in welcome: w[k] = welcome[k]
        if 'extra' in welcome: w['extra'] = L(*welcome['extra'])
        if 'text' in welcome: w['text'] = L(*welcome['text'])
        if welcome.get('limited'): w['limited_time'] = True
        c['welcome'] = w
    if intro: c['intro_apr'] = {'months': intro[0], 'on': intro[1]}
    if fx is not None: c['fx_fee'] = fx
    c['highlights'] = [_hl(h) for h in hl]
    if tags: c['tags'] = list(tags)
    c['status'] = status
    if status_note: c['status_note'] = L(*status_note)
    c['apply_url'] = apply or src
    c['source_url'] = src
    if img: c['image_url'] = img
    c['last_verified'] = TODAY
    if notes: c['notes'] = notes
    if review: c['needs_review'] = True
    return c

def write(issuer, cards):
    ids = [c['id'] for c in cards]
    assert len(ids) == len(set(ids)), 'duplicate ids'
    p = os.path.join(ROOT, 'data', 'cards', issuer + '.json')
    json.dump(cards, open(p, 'w'), ensure_ascii=False, indent=2)
    open(p, 'a').write('\n')
    print(issuer, len(cards), 'cards')
