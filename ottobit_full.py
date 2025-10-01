from microbit import *
import music

class Halt(Exception):
    pass

class Robot:

    def __init__(self):
        self.RA, self.MA = 0x08, 0x68

        self.M1A, self.M1B, self.M2A, self.M2B = 5, 6, 7, 8

        self.MPG = 0x47

        self.LP = pin1

        self.gs, self.ts = 110, 110

        self.TA, self.TN = 941, 81

        self.SP = (self.TA + self.TN) // 2
        self.kp = 0.12
        self.kd = 0.06
        self.max_corr = 70
        self.prev_lv = self.SP

        self.seek_overshoot = 8
        self.seek_timeout_ms = 1500
        self.seek_turn_speed = 110

        self.cross_overshoot_ms = 500
        self.cross_overshoot_speed = 80

        self.ca = 0.0
        self.go = 0.0

        self.init_mpu()
        self.stop()
        display.show(Image.HAPPY)
        sleep(500)

    def wr(self, r, d):
        try:
            i2c.write(self.RA, bytes([r, d]))
        except:
            pass

    def rd(self, a):
        try:
            i2c.write(self.MA, bytes([a]))
            d = i2c.read(self.MA, 2)
            v = (d[0] << 8) + d[1]
            return -((65535 - v) + 1) if v >= 0x8000 else v
        except:
            return 0

    def init_mpu(self):
        try:
            i2c.write(self.MA, bytes([0x6B, 0]))
            sleep(100)
            total = 0
            for _ in range(20):
                total += self.rd(self.MPG) / 131.0
                sleep(10)
            self.go = total / 20.0
        except:
            pass

    def gyro(self):
        return self.rd(self.MPG) / 131.0 - self.go

    def _gyro_turn_to(self, target_angle, stop_fine_if_line=True, line_check_samples=3):
        direction = 1 if (target_angle - self.ca + 540) % 360 - 180 > 0 else -1
        st = running_time()
        lt = st
        a = self.ca
        while True:
            if button_b.was_pressed():
                self.clear_all()
                display.show(Image.SKULL)
                sleep(500)
                reset()
                
            ct = running_time()
            dt = (ct - lt) / 1000.0
            a += self.gyro() * dt
            while a > 180: a -= 360
            while a < -180: a += 360
            ae = target_angle - a
            if ae > 180: ae -= 360
            elif ae < -180: ae += 360

            if abs(ae) < 5:
                break

            ts = self.ts if abs(ae) > 30 else (75 if abs(ae) > 15 else 60)
            if direction > 0:
                self.motors(-ts, ts)
            else:
                self.motors(ts, -ts)

            lt = ct
            if (ct - st) > 3000:
                break
            sleep(10)
        self.stop()

        self.ca = a
 
    def line(self):
        return self.LP.read_analog()

    def motors(self, left, right):
        if left >= 0:
            self.wr(self.M1A, min(255, left))
            self.wr(self.M1B, 0)
        else:
            self.wr(self.M1A, 0)
            self.wr(self.M1B, min(255, -left))

        if right >= 0:
            self.wr(self.M2A, min(255, right))
            self.wr(self.M2B, 0)
        else:
            self.wr(self.M2A, 0)
            self.wr(self.M2B, min(255, -right))

    def stop(self):
        self.wr(self.M1A, 0)
        self.wr(self.M1B, 0)
        self.wr(self.M2A, 0)
        self.wr(self.M2B, 0)
        display.show(Image.SQUARE_SMALL)

    def clear_all(self):
        self.stop()
        self.ca = 0.0
        display.clear()
        sleep(100)

    def clamp(self, v, lo, hi):
        return lo if v < lo else (hi if v > hi else v)

    def follow_corr(self, lv):
        error = self.SP - lv
        dterm = (self.prev_lv - lv)
        corr = int(self.kp * error + self.kd * dterm)
        self.prev_lv = lv
        return self.clamp(corr, -self.max_corr, self.max_corr)

    def forward(self, timeout_ms=3000, speed=None, stop_on_cross=True):
        move_speed = self.gs if speed is None else int(speed)
        display.show(Image.ARROW_S)
        start = running_time()
        initial_on_cross = self.line() > self.TA
        cross_armed = (not stop_on_cross) or (not initial_on_cross)
        while True:
            if button_b.was_pressed():
                self.clear_all()
                display.show(Image.SKULL)
                sleep(500)
                reset()
            if (running_time() - start) > int(timeout_ms):
                break
            lv = self.line()
            if stop_on_cross and not cross_armed and lv <= self.TA:
                cross_armed = True
            if lv > self.TA:
                if stop_on_cross and cross_armed:
                    if self.cross_overshoot_ms > 0:
                        creep_spd = min(move_speed, self.cross_overshoot_speed)
                        self.motors(creep_spd, creep_spd)
                        sleep(self.cross_overshoot_ms)
                    self.stop()
                    sleep(60)
                    break
                self.motors(move_speed, move_speed)
                sleep(120)
                continue
            if lv > self.TN:
                corr = self.follow_corr(lv)
                L = self.clamp(move_speed - corr, 0, 255)
                R = self.clamp(move_speed + corr, 0, 255)
                self.motors(L, R)
            else:
                corr = self.follow_corr(lv)
                L = self.clamp(move_speed - corr, 0, 255)
                R = self.clamp(move_speed + corr, 0, 255)
                self.motors(L, R)
            sleep(10)
        self.stop()
        sleep(80)
        return True

    def turn_to_line(self, left=True, base_angle=90):
        if left:
            display.show(Image.ARROW_E)
        else:
            display.show(Image.ARROW_W)
        angle = base_angle if left else -base_angle
        ta = self.ca + (angle - self.seek_overshoot if angle > 0 else angle + self.seek_overshoot)
        while ta > 180: ta -= 360
        while ta < -180: ta += 360
        self._gyro_turn_to(ta, stop_fine_if_line=True, line_check_samples=3)

        st = running_time()
        ts = self.seek_turn_speed
        if left:
            self.motors(-ts, ts)
        else:
            self.motors(ts, -ts)

        while running_time() - st < self.seek_timeout_ms:
            if button_b.was_pressed():
                self.clear_all()
                display.show(Image.SKULL)
                sleep(500)
                reset()
                
            lv = self.line()
            if self.TN < lv < self.TA:
                break
            sleep(8)

        self.stop()
        return True


    def left(self):
        return self.turn_to_line(left=True, base_angle=90)

    def right(self):
        return self.turn_to_line(left=False, base_angle=90)

    def back(self):
        return self.turn_to_line(left=True, base_angle=180)

    def collect(self, n=1, color=None):
        col = str(color or "").lower()
        if col not in ("yellow", "green", "red"):
            return
        for _ in range(int(n)):
            c = _cell_counts()
            if not c.get("allowed", True):
                self.stop()
                display.show(Image.NO)
                try:
                    music.play(music.POWER_DOWN, pin=pin0, wait=False)
                except:
                    pass
                # Wait until user presses A to acknowledge defeat, then signal halt
                while True:
                    if button_a.was_pressed():
                        raise Halt()
                    if button_b.was_pressed():
                        self.clear_all()
                        display.show(Image.NO)
                    sleep(100)
            if c.get(col, 0) > 0:
                c[col] -= 1
                try:
                    _victory_collected[col] += 1
                except:
                    pass
        for _ in range(int(n)):
            if button_b.was_pressed():
                self.clear_all()
                display.show(Image.SKULL)
                sleep(500)
                reset()
                
            music.play(music.BA_DING, pin=pin0, wait=False)
            sleep(300)
        sleep(100)

    def start_sound(self):
        if button_b.was_pressed():
            self.clear_all()
            display.show(Image.SKULL)
            sleep(500)
            reset()
            
        music.play(music.POWER_UP, pin=pin0, wait=False)
        sleep(500)

    def finish_sound(self):
        if button_b.was_pressed():
            self.clear_all()
            display.show(Image.SKULL)
            sleep(500)
            reset()
            
        music.play(music.POWER_DOWN, pin=pin0, wait=False)
        sleep(500)

def run_route(r):
    def forward(n=1, timeout_ms=3000, speed=None, stop_on_cross=True):
        for _ in range(int(n)):
            if not r.forward(timeout_ms=timeout_ms, speed=speed, stop_on_cross=stop_on_cross):
                return False
            dx, dy = _dir_to_delta(robot_state["dir"])
            robot_state["x"] += dx
            robot_state["y"] += dy
        return True

    def turnLeft(n=1):
        if not r.left():
            return False
        robot_state["dir"] = (robot_state["dir"] - 1) % 4
        return True

    def turnRight(n=1):
        if not r.right():
            return False
        robot_state["dir"] = (robot_state["dir"] + 1) % 4
        return True

    def turnBack(n=1):
        if not r.back():
            return False
        robot_state["dir"] = (robot_state["dir"] + 2) % 4
        return True

    def collect(n=1, color=None):
        r.collect(n, color)
        return True

    def startSound():
        r.start_sound()
        return True

    def finishSound():
        r.finish_sound()
        return True

    user_route(forward, turnLeft, turnRight, turnBack, collect, startSound, finishSound)
    return True

challengeJson = {
    "robot": {"tile": {"x": 1, "y": 1}, "direction": "east"},
    "batteries": [{
        "tiles": [
            {"x": 3, "y": 1, "count": 1, "type": "yellow", "spread": 1.0, "allowedCollect": False}
        ]
    }],
    "victory": {"byType": [{"red": 0, "yellow": 2, "green": 0}]},
    "statement": ["forward", "collect"],
    "minCards": 2,
    "maxCards": 3
}

robot_state = {
    "x": challengeJson["robot"]["tile"]["x"],
    "y": challengeJson["robot"]["tile"]["y"],
    "dir": {"north":0, "east":1, "south":2, "west":3}.get(challengeJson["robot"]["direction"].lower(), 1)
}

_battery_map = {}
for group in challengeJson.get("batteries", []):
    for t in group.get("tiles", []):
        key = (t["x"], t["y"])
        entry = _battery_map.get(key, {"yellow":0, "red":0, "green":0, "allowed":True})
        col = t.get("type", "yellow")
        entry[col] = entry.get(col, 0) + int(t.get("count", 1))
        entry["allowed"] = bool(t.get("allowedCollect", True)) and entry.get("allowed", True)
        _battery_map[key] = entry

def _dir_to_delta(d):
    return [(0, -1), (1, 0), (0, 1), (-1, 0)][d % 4]

def _cell_counts():
    return _battery_map.get((robot_state["x"], robot_state["y"]), {"yellow":0, "red":0, "green":0, "allowed":True})

def isGreen():
    c = _cell_counts()
    return c.get("green", 0) > 0

def isYellow():
    c = _cell_counts()
    return c.get("yellow", 0) > 0

def isRed():
    c = _cell_counts()
    return c.get("red", 0) > 0

_victory_required = {"yellow":0, "red":0, "green":0}
for v in challengeJson.get("victory", {}).get("byType", []):
    for k in ("yellow", "red", "green"):
        try:
            _victory_required[k] += int(v.get(k, 0))
        except:
            pass
_victory_collected = {"yellow":0, "red":0, "green":0}

def _check_victory():
    return (
        _victory_collected["yellow"] == _victory_required["yellow"] and
        _victory_collected["red"] == _victory_required["red"] and
        _victory_collected["green"] == _victory_required["green"]
    )

def user_route(forward, turnLeft, turnRight, turnBack, collect, startSound, finishSound):
    startSound()

    forward(2)
    collect(1, "yellow") 
    
    forward(1)
    if _check_victory():
        display.show(Image.YES)
    else:
        display.show(Image.NO)
    finishSound()

r = Robot()
while True:
    try:
        if button_a.was_pressed():
            run_route(r)
        elif button_b.was_pressed():
            r.clear_all()
            display.show(Image.SKULL)
            sleep(500)
        sleep(100)
    except Halt:
        # Program halted due to defeat; keep NO on screen until user presses A to run again
        r.stop()
        display.show(Image.NO)
        while True:
            if button_a.was_pressed():
                break
            if button_b.was_pressed():
                r.clear_all()
                display.show(Image.NO)
            sleep(100)