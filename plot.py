import matplotlib.pyplot as plt
import json
import datetime as dt
import matplotlib.dates as mdates
import time

fig, ax = plt.subplots(figsize=(14, 8))

with open('donations.json') as f:
    data = json.load(f)
    
t = [dt.datetime.strptime(donation["updated_at"], '%Y-%m-%dT%H:%M:%S+01:00') for donation in data["donations"]]
s = [donation["donated_amount_in_cents"]/100 for donation in data["donations"]]

fig.autofmt_xdate()
ax.grid()
ax.plot(t, s)

ax.ticklabel_format(axis='y', useOffset=False, style='plain')

ax.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M"))
#ax.hlines([170000, 300000, 470000, 620000, 640000, 730000, 887491, 1190366], t[0], t[-1], color='orange')
ax.hlines([170000, 200000, 470000, 620000, 730000, 1000000], t[0], t[-1], color=['orange', 'orange', 'orange', 'orange', 'orange', 'red'])
add = 45
ax.text(t[-1] + dt.timedelta(minutes=add), 170000, "FF1")
ax.text(t[-1] + dt.timedelta(minutes=add), 200000, "FF2")
#ax.text(t[-1] + dt.timedelta(minutes=add), 470000, "FF3 (Zuschauer)")
#ax.text(t[-1] + dt.timedelta(minutes=add), 620000, "FF4 (Zuschauer)")
ax.text(t[-1] + dt.timedelta(minutes=add), 470000, "FF3")
#ax.text(t[-1] + dt.timedelta(minutes=add), 730000, "FF5 (Zuschauer)")
ax.text(t[-1] + dt.timedelta(minutes=add), 620000, "FF4")
ax.text(t[-1] + dt.timedelta(minutes=add), 730000, "FF5")
ax.text(t[-1] + dt.timedelta(minutes=add), 1000000, "1 Mio")

ax.set(xlabel='Uhrzeit', ylabel='Euro', title='Friendly Fire 6 (Zuschauerspenden)')

fig.savefig("images/donations.png")

ax.clear()

t = [dt.datetime.strptime(donation["updated_at"], '%Y-%m-%dT%H:%M:%S+01:00') for donation in data["donations"] if donation["donations_count"] > 0]
s = [donation["donations_count"] for donation in data["donations"] if donation["donations_count"] > 0]
t2 = [dt.datetime.strptime(donation["updated_at"], '%Y-%m-%dT%H:%M:%S+01:00') for donation in data["donations"] if donation["donor_count"] > 0]
s2 = [donation["donor_count"] for donation in data["donations"] if donation["donor_count"] > 0]

ax.grid()
ax.plot(t, s, label="Anzahl Spenden")
ax.plot(t, s2, label="Anzahl Spender")
ax.legend()

ax.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M"))

ax.set(xlabel='Uhrzeit', ylabel='Spenden/Spender', title='Friendly Fire 6 (Anzahl Spenden/Spender)')

fig.savefig("images/donors.png")

