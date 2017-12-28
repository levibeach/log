Date.prototype.subtractDays = function(days) {
  let date = new Date(this.valueOf())
  date.setDate(date.getDate() - days)
  return date
}

Date.prototype.addDays = function(days) {
  let date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}

Log = window.Log || {}
Log.data = {

  /**
   * Parse log data
   * @param {Object[]=} ent - Entries
   */
  parse(ent = Log.log) {
    if (ent.length === 0) return

    let p = []

    for (let i = 0, l = ent.length; i < l; i++) {
      let e = ent[i]

      if (Log.time.date(e.s) !== Log.time.date(e.e) && e.e !== 'undefined') {
        let a = Log.time.convert(Log.time.parse(e.s))
        let b = Log.time.convert(Log.time.parse(e.e))

        p.push({
          s: e.s,
          e: Log.time.toHex(new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59, 59)),
          c: e.c,
          t: e.t,
          d: e.d
        })

        p.push({
          s: Log.time.toHex(new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0)),
          e: e.e,
          c: e.c,
          t: e.t,
          d: e.d
        })
      } else {
        p.push(e)
      }
    }

    return p
  },

  /**
   * Get entries by date
   * @param {Object} d - Date
   * @returns {Object[]} Entries
   */
  getEntriesByDate(d) {
    let ent = []

    for (let i = 0, l = Log.log.length; i < l; i++) {
      if (Log.log[i].e === 'undefined') continue

      let a = Log.time.convert(Log.time.parse(Log.log[i].s))

      a.getFullYear() === d.getFullYear()
      && a.getMonth() === d.getMonth()
      && a.getDate() === d.getDate()
      && ent.push(Log.log[i])
    }

    return ent
  },

  /**
   * Get entries from a certain period
   * @param {Object} ps - Period start
   * @param {Object=} pe - Period end
   * @returns {Object[]} Entries
   */
  getEntriesByPeriod(ps, pe = new Date()) {
    let ent = []

    let span = ((start, stop) => {
      let dates = []
      let current = start

      while (current <= stop) {
        dates.push(new Date(current))
        current = current.addDays(1)
      }

      return dates
    })(ps, pe)

    for (let i = 0, l = span.length; i < l; i++) {
      let a = Log.data.getEntriesByDate(span[i])
      for (let o = 0, ol = a.length; o < ol; o++) {
        ent.push(a[o])
      }
    }

    return ent
  },

  /**
   * Get entries from the last n days
   * @param {number} n - The number of days
   * @returns {Object[]} Entries
   */
  getRecentEntries(n) {
    return Log.data.getEntriesByPeriod(new Date().subtractDays(n))
  },

  /**
   * Get entries of a specific day of the week
   * @param {number} d - A day of the week (0 - 6)
   * @returns {Object[]} Entries
   */
  getEntriesByDay(d, ent = Log.log) {
    if (ent.length === 0) return

    let entries = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && Log.time.convert(Log.time.parse(ent[i].s)).getDay() === d) {
        entries.push(ent[i])
      }
    }

    return entries
  },

  /**
   * Get entries of a specific project
   * @param {string} pro - Project
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Entries
   */
  getEntriesByProject(pro, ent = Log.log) {
    if (ent.length === 0) return

    let entries = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && ent[i].t === pro) {
        entries.push(ent[i])
      }
    }

    return entries
  },

  /**
   * Get entries of a specific sector
   * @param {string} sec - Sector
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Entries
   */
  getEntriesBySector(sec, ent = Log.log) {
    if (ent.length === 0) return

    let entries = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && ent[i].c === sec) {
        entries.push(ent[i])
      }
    }

    return entries
  },

  /**
   * Sort entries by date
   * @param {Object[]=} ent - Entries
   * @param {Object=} end - End date
   */
  sortEntries(ent = Log.log, end = new Date()) {
    if (ent.length === 0) return

    let days = Log.time.listDates(
      Log.time.convert(Log.time.parse(ent[0].s)), end
    )
    let list = []
    let slots = []

    for (let i = 0, l = days.length; i < l; i++) {
      list.push(
        Log.time.date(Log.time.toHex(
          new Date(days[i].getFullYear(), days[i].getMonth(), days[i].getDate(), 0, 0, 0)
        ))
      )

      slots.push([])
    }

    for (let i = 0, l = ent.length; i < l; i++) {
      let index = list.indexOf(Log.time.date(ent[i].s))
      if (index > -1) slots[index].push(ent[i])
    }

    return slots
  },

  /**
   * Sort entries by day
   * @returns {Object[]} Entries sorted by day
   */
  sortEntriesByDay(ent = Log.log) {
    let sort = []

    for (let i = 0; i < 7; i++) {
      sort.push(Log.data.getEntriesByDay(i, ent))
    }

    return sort
  },

  /**
   * List projects
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of projects
   */
  listProjects(ent = Log.log) {
    if (ent.length === 0) return

    let list = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && list.indexOf(ent[i].t) === -1) {
        list.push(ent[i].t)
      }
    }

    return list
  },

  /**
   * List sectors
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of sectors
   */
  listSectors(ent = Log.log) {
    if (ent.length === 0) return

    let list = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e !== 'undefined' && list.indexOf(ent[i].c) === -1) {
        list.push(ent[i].c)
      }
    }

    return list
  },

  /**
   * Get peak days
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak days
   */
  peakDays(ent = Log.log) {
    if (ent.length === 0) return

    let days = Array(7).fill(0)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      days[Log.time.convert(Log.time.parse(ent[i].s)).getDay()] += Log.time.duration(ent[i].s, ent[i].e)
    }

    return days
  },

  /**
   * Get peak day
   * @param {Object[]=} pk - Peak days
   * @returns {string} Peak day
   */
  peakDay(pk = Log.cache.peakDays) {
    if (pk.length === 0) return
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][pk.indexOf(Math.max(...pk))]
  },

  /**
   * Get peak hours
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} Peak hours
   */
  peakHours(ent = Log.log) {
    if (ent.length === 0) return

    let hours = Array(24).fill(0)

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      let es = Log.time.parse(ent[i].s)
      let index = Log.time.convert(es).getHours()

      let time = Log.time.duration(ent[i].s, ent[i].e)

      if (time > 1) {
        let remainder = time - Math.floor(time)
        hours[index] += remainder
        time -= remainder
        index++

        while (time > 0) {
          time -= 1
          hours[index] += time
          index++
          if (index > 23) break
        }
      } else {
        hours[index] += time
      }
    }

    return hours
  },

  /**
   * Get peak hour
   * @param {Object[]=} pk - Peak hours
   * @returns {string} Peak hour
   */
  peakHour(pk = Log.cache.peakHours) {
    if (pk.length === 0) return
    return `${pk.indexOf(Math.max(...pk))}:00`
  },

  /**
   * List durations
   * @param {Object[]=} ent - Entries
   * @returns {Object[]} List of durations
   */
  listDurations(ent = Log.log) {
    if (ent.length === 0) return

    let list = []

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === 'undefined') continue

      list.push(Log.time.duration(ent[i].s, ent[i].e))
    }

    return list
  },

  /**
   * Calculate shortest log session
   * @param {Object[]=} list - Durations
   * @returns {number} Shortest log session
   */
  lsmin(list = Log.cache.durations) {
    if (list === undefined) return 0
    return list.length === 0 ? 0 : Math.min(...list)
  },

  /**
   * Calculate longest log session
   * @param {Object[]=} list - Durations
   * @returns {number} Longest log session
   */
  lsmax(list = Log.cache.durations) {
    if (list === undefined) return 0
    return list.length === 0 ? 0 : Math.max(...list)
  },

  /**
   * Calculate average session duration (ASD)
   * @param {Object[]=} list - Durations
   * @returns {number} Average session duration
   */
  asd(list = Log.cache.durations) {
    if (list === undefined || list.length === 0) return 0

    let c = 0

    let avg = list.reduce(
      (total, num) => {
        c++
        return total + num
      }, 0
    )

    return avg / c
  },

  /**
   * Calculate the total number of logged hours
   * @param {Object[]=} ent - Entries
   * @returns {number} Total logged hours
   */
  lh(ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.listDurations(ent).reduce(
      (total, num) => total + num, 0
    )
  },

  /**
   * Calculate average logged hours
   * @param {Object[]=} ent - Sorted entries
   * @returns {number} Average logged hours
   */
  avgLh(ent = Log.cache.sortEntries) {
    if (ent.length === 0) return 0

    let h = 0

    for (let i = 0, l = ent.length; i < l; i++) {
      h += Log.data.lh(ent[i])
    }

    return h / ent.length
  },

  /**
   * Calculate how much of a time period was logged
   * @param {Object[]=} ent - Entries
   * @returns {number} Log percentage
   */
  lp(ent = Log.log) {
    if (ent.length === 0) return 0

    let e = Log.time.convert(Log.time.parse(ent[0].s))
    let d = Log.time.convert(Log.time.parse(ent.slice(-1)[0].s))

    let h = Log.data.lh(ent)
    let n = Math.ceil((
              new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
              new Date(e.getFullYear(), e.getMonth(), e.getDate())
            ) / 8.64e7)

    return h / (24 * (n + 1)) * 100
  },

  /**
   * Calculate sector hours
   * @param {Object[]=} ent - Entries
   * @param {string} sec - Sector
   * @returns {number} Sector hours
   */
  sh(sec, ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.lh(Log.data.getEntriesBySector(sec, ent))
  },

  /**
   * Calculate sector percentage
   * @param {Object[]=} ent - Entries
   * @param {string} sec - Sector
   * @returns {number} Sector percentage
   */
  sp(sec, ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.sh(sec, ent) / Log.data.lh(ent) * 100
  },

  /**
   * Calculate project hours
   * @param {Object[]=} ent - Entries
   * @param {string} pro - Project
   * @returns {number} Project hours
   */
  ph(pro, ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.lh(Log.data.getEntriesByProject(pro, ent))
  },

  /**
   * Calculate project percentage
   * @param {Object[]=} ent - Entries
   * @param {string} pro - Project
   * @returns {number} Project percentage
   */
  pp(pro, ent = Log.log) {
    return ent.length === 0 ? 0 : Log.data.ph(pro, ent) / Log.data.lh(ent) * 100
  },

  /**
   * Calculate trend
   * @param {number} a
   * @param {number} b
   * @returns {number} Trend
   */
  trend(a, b) {
    return (a - b) / b * 100
  },

  /**
   * Calculate streak
   * @param {Object[]=} ent - Sorted entries
   * @returns {number} Streak
   */
  streak(ent = Log.cache.sortEntries) {
    if (ent.length === 0) return 0

    let streak = 0

    for (let i = 0, l = ent.length; i < l; i++) {
      streak = ent[i].length === 0 ? 0 : streak + 1
    }

    return streak
  },

  /**
   * Get an array of focus stats
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Sorted entries
   * @returns {Object[]} Array of focus stats
   */
  listFocus(mode, ent = Log.cache.sortEntries) {
    if (ent.length === 0) return

    let list = []

    if (mode === 'sector') {
      for (let i = 0, l = ent.length; i < l; i++) {
        let f = Log.data.sectorFocus(Log.data.listSectors(ent[i]))
        if (f !== 0) list.push(f)
      }
    } else if (mode === 'project') {
      for (let i = 0, l = ent.length; i < l; i++) {
        let f = Log.data.sectorFocus(Log.data.listProjects(ent[i]))
        if (f !== 0) list.push(f)
      }
    }

    return list
  },

  /**
   * Calculate sector focus
   * @param {Object[]=} list - Sectors list
   */
  sectorFocus(list = Log.cache.sectors) {
    return list.length === 0 ? 0 : 1 / list.length
  },

  /**
   * Calculate project focus
   * @param {Object[]=} list - Projects list
   */
  projectFocus(list = Log.cache.projects) {
    return list.length === 0 ? 0 : 1 / list.length
  },

  /**
   * Calculate minimum focus
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Sorted entries
   */
  minFocus(mode, ent = Log.cache.sortEntries) {
    return ent.length === 0 ? 0 : Math.min(...Log.data.listFocus(mode, ent))
  },

  /**
   * Calculate maximum focus
   * @param {string} mode - Sector or project
   * @param {Object[]=} ent - Sorted entries
   */
  maxFocus(mode, ent = Log.cache.sortEntries) {
    return ent.length === 0 ? 0 : Math.max(...Log.data.listFocus(mode, ent))
  },

  /**
   * Calculate average focus
   * @param {Object[]=} ent - Entries
   */
  focusAvg(ent = Log.log) {
    if (ent.length === 0) return

    let avg = Log.data.listSectors(ent).reduce(
      (total, num) => {
        return total + Log.data.sh(num, ent) * (Log.data.sp(num, ent) / 100)
      }, 0)

    return avg / Log.data.lh(ent)
  },

  forecast: {

    /**
     * Forecast sector focus
     * @returns {string} Sector focus
     */
    sf() {
      let ent = Log.data.getEntriesByDay(new Date().getDay())

      if (ent.length === 0) return '-'

      let s = Log.data.listSectors(ent)
      let sf = 0
      let sfs = ''

      for (let i = 0, l = s.length; i < l; i++) {
        let x = Log.data.sp(s[i], ent)
        x > sf && (sf = x, sfs = s[i])
      }

      return sfs
    },

    /**
     * Forecast project focus
     * @returns {string} Project focus
     */
    pf() {
      let ent = Log.data.getEntriesByDay(new Date().getDay())

      if (ent.length === 0) return '-'

      let p = Log.data.listProjects(ent)
      let pf = 0
      let pfp = ''

      for (let i = 0, l = p.length; i < l; i++) {
        let x = Log.data.pp(p[i], ent)
        x > pf && (pf = x, pfp = p[i])
      }

      return pfp
    },

    /**
     * Forecast peak time
     * @returns {string} Peak time
     */
    pt() {
      return Log.data.peakHour(Log.data.peakHours(Log.data.getEntriesByDay(new Date().getDay())))
    },

    /**
     * Forecast log hours
     * @returns {number} Log hours
     */
    lh() {
      return Log.data.avgLh(Log.data.sortEntries(Log.data.getEntriesByDay(new Date().getDay()))) * 10
    },

    /**
     * Forecast session duration
     * @returns {number} Session duration
     */
    sd() {
      return Log.data.asd(Log.data.listDurations(Log.data.getEntriesByDay(new Date().getDay())))
    }
  }
}
