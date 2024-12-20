import { Listbox, Transition } from "@headlessui/react"
import React, { Fragment } from "react"

const UserDataEntry = ({ t, inputRef, isUserDataEntered, isFocused, isDataWillBeSaved, inputType, userName, geminiApiKey, handleNameChange, handleApiKeyChange, onFocusHandler, onBlurHandler, changeVisibilityPassword, changeUserDataSetting, saveUserData }) => {
  let charsLimit = ''
  if (userName.length >= 50) charsLimit = `${t('chars_limit_exceeded')}`
  else charsLimit = `${userName.length} / 50`
  return !isUserDataEntered && (
    <div className="fixed lg:absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm duration-75 animate__animated animate__fadeIn">
      <Transition
        appear
        show={!isUserDataEntered}
        as={Fragment}
        enter="ease-out duration-500"
        enterFrom="opacity-0 translate-y-full scale-50"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="ease-in duration-300"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-full scale-50"
        className={"fixed inset-0 md:w-2/3 lg:w-1/2 m-auto h-min"}
      >
        <article className="flex flex-col items-center justify-center max-h-[75%] max-w-5xl mx-4 md:mx-auto bg-cyan-500 dark:bg-gray-700 text-cyan-900 dark:text-white shadow-lg dark:shadow-white/50 rounded-lg duration-200 overflow-hidden">
          <h3 className="text-white text-center bg-cyan-500 dark:bg-gray-700 p-4 duration-200">AI Website Builder - Create A Website In Minutes</h3>
          <form ref={inputRef} className="flex flex-col items-center max-h-full w-full p-4 bg-cyan-50 dark:bg-gray-900 text-cyan-900 dark:text-white duration-200 overflow-y-auto overflow-x-hidden md:overflow-hidden" onSubmit={saveUserData}>
          <h2 class="text-center text-lg font-semibold mb-3">BUBBLEAI: AI Website Generator</h2>
          <p class="text-center text-sm mb-4">Enter your token details, and BUBBLE will generate a website for you. No coding required!</p>
          <p class="text-center text-sm mb-4">Created by Richie.eth. Buy $BUBBLE to support me !!!</p>
            <input
              type="text"
              className="hidden input-name w-full m-1 p-2 border border-cyan-800 dark:border-gray-100 bg-cyan-50/25 dark:bg-gray-900/25 text-base text-black dark:text-white rounded-md shadow-inner dark:shadow-white/50 duration-200"
              placeholder={t('type_name')}
              value={userName}
              onChange={handleNameChange}
              onFocus={onFocusHandler}
              onBlur={onBlurHandler}
              autoFocus
            />
            {isFocused
              ? userName.length >= 50
                ? <label className="w-full pl-1 text-justify leading-tight text-sm text-red-700 dark:text-red-500 duration-200" htmlFor="input-title">{charsLimit}</label>
                : <label className="w-full pl-1 text-justify leading-tight text-sm text-cyan-800 dark:text-cyan-500 duration-200" htmlFor="input-title">{charsLimit}</label>
              : <label className="text-sm text-transparent">_</label>}
            <br />
            <div className="hidden input-api-key  items-center border border-cyan-800 dark:border-gray-100 bg-cyan-50/25 dark:bg-gray-900/25 w-full text-base text-black dark:text-white rounded-md shadow-inner duration-200 dark:shadow-white/50">
              <input
                type={inputType}
                className="input-api-key w-full m-0.5 p-1.5 border border-cyan-800 dark:border-gray-100 bg-cyan-50/25 dark:bg-gray-900/25 text-base text-black dark:text-white rounded-md shadow-inner dark:shadow-white/50 duration-200"
                placeholder={t('type_api_key')}
                value={geminiApiKey}
                onChange={handleApiKeyChange}
                onFocus={onFocusHandler}
                onBlur={onBlurHandler}
                autoFocus
                required
              />
              <button className="bg-cyan-500 hover:bg-cyan-700 active:bg-cyan-900 dark:bg-gray-700 dark:hover:bg-gray-500 active:dark:bg-gray-900 m-0.5 p-1.5 rounded-md duration-300" onClick={changeVisibilityPassword}>
                {inputType === 'password'
                  ? <img className="h-7 object-contain duration-200" src={`${import.meta.env.BASE_URL}images/show-icon.svg`} alt="Hide API Key" />
                  : <img className="h-7 object-contain duration-200" src={`${import.meta.env.BASE_URL}images/hide-icon.svg`} alt="Show API Key" />
                }
              </button>
            </div>
            <br />

            <Listbox value={isDataWillBeSaved} onChange={changeUserDataSetting} className="w-full bg-cyan-50 dark:bg-gray-900 text-cyan-900 dark:text-white duration-200">
              <Listbox.Options static className="max-h-full flex items-center justify-center">
                <Listbox.Option as="label" className={"cursor-pointer p-2"}>
                  <input
                    type="checkbox"
                    className="hidden app-usage-confirmation-checkbox accent-cyan-600 dark:accent-gray-600 h-5 w-5 duration-200"
                    checked={true}
                    onChange={changeUserDataSetting} />
                </Listbox.Option>
              </Listbox.Options>
            </Listbox>
            <div className="flex">
            <button type="submit" className="w-fit m-4 px-8 py-2 bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-center text-white rounded-md shadow-md dark:shadow-white/50 duration-200">{t('enter')}</button>
            <button
  type="button"
  className="w-fit m-4 px-8 py-2 bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-center text-white rounded-md shadow-md dark:shadow-white/50 duration-200"
  onClick={() => window.open('#', '_blank')}
>
  {t('Buy $BUBBLE')}
</button>
<button
  type="button"
  className="w-fit m-4 px-8 py-2 bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-center text-white rounded-md shadow-md dark:shadow-white/50 duration-200"
  onClick={() => window.open('https://x.com/BubbleAI_Sol', '_blank')}
>
  {t('Twitter')}
</button>
            </div>
          </form>
        </article>
      </Transition>
    </div>
  )
}

export default UserDataEntry