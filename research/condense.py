import re,sys
noise=re.compile(r'^(Opens |Links to|Compare|Comparing|checkmark|empty checkbox|button disabled|Apply Now|See details|Learn more|†Pricing|Rewards Program Agreement|Skips to|Grid$|List$|Pricing & Terms|Rates & Fees|Terms Apply)',re.I)
seen=None
for l in open(sys.argv[1]):
    l=l.strip()
    if not l or noise.match(l): continue
    l=re.sub(r'Min\. of \([0-9.+]+\) and [0-9.]+%','',l)
    l=re.sub(r'Opens pricing and terms in new window','',l)
    if l==seen: continue
    seen=l; print(l)
