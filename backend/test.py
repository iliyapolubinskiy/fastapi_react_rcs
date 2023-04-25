from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from random import uniform, randint
from string import ascii_letters

chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--incognito")

driver = webdriver.Chrome(chrome_options=chrome_options)

n = 4

usernames = ["".join([ascii_letters[randint(1, 51)] for _ in range(8)]) for _ in range(n)]
fname = list(map(lambda x: x+"fname", usernames))
sname = list(map(lambda x: x+"sname", usernames))
passwords = list(map(lambda x: x+"pw", usernames))

with open(f"data-{time.time()}.txt", "w", encoding='UTF-8') as file:
    for i in range(len(usernames)):
        file.write(f'{usernames[i], fname[i], sname[i], passwords[i]}\n')

current_link = "http://192.168.0.16:3000/"
tabs = []
rooms = []


for i in range(n):
    if len(tabs) == 2:
        for tab in tabs:
            driver.switch_to.window(tab)
            driver.close()
        tabs = []
        driver.switch_to.new_window('window')
    else:
        driver.switch_to.new_window('window')
    driver.get(current_link)
    tabs.append(driver.current_window_handle)
    time.sleep(1)
    create_account_btn = driver.find_element(By.ID, "tabs-:r0:--tab-1")
    create_account_btn.click()
    
    first_name_input = driver.find_element(By.ID, "form1Field4")
    first_name_input.send_keys(fname[i])

    last_name_input = driver.find_element(By.ID, "form1Field5")
    last_name_input.send_keys(sname[i])

    username_input = driver.find_element(By.ID, "form1Field1")
    username_input.send_keys(usernames[i])

    pw_input = driver.find_element(By.ID, "form1Field2")
    pw_input.send_keys(passwords[i])
    
    repeat_pw_input = driver.find_element(By.ID, "form1Field3")
    repeat_pw_input.send_keys(passwords[i])
    
    time.sleep(1)

    signup_btn = driver.find_element(By.ID, 'signup-button')
    signup_btn.click()

    time.sleep(1)

    if not rooms:
        create_room_btn = driver.find_element(By.XPATH, '//*[@id="root"]/div/div/div/button[1]')
        create_room_btn.click()

        time.sleep(1)

        room_number = driver.find_element(By.ID, 'room').get_attribute("value")
        rooms.append(room_number)
    else:
        room_number = rooms.pop()
        driver.find_element(By.ID, 'room').send_keys(room_number)

    time.sleep(1)

    go_to_room_btn = driver.find_element(By.XPATH, '//*[@id="root"]/div/div/form/div[2]/button')

    time.sleep(4)

    go_to_room_btn.click()

    time.sleep(1)

    items = [driver.find_element(By.CSS_SELECTOR, "label[for='rock']"),driver.find_element(By.CSS_SELECTOR, "label[for='scissors']"), driver.find_element(By.CSS_SELECTOR, "label[for='paper']")]
    items[randint(0, 2)].click()

    ready_button = driver.find_element(By.ID, "myStatus")
    ready_button.click()
    time.sleep(8)




input()