import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uiSliceActions } from '../store/ui-slice'

const ThemeModal = () => {
    const dispatch = useDispatch()

    const theme = useSelector(state => state?.ui?.theme)

    const closeThemeModal = e => {
        if (e.target.classList.contains("theme")) {
            dispatch(uiSliceActions.closeThemeModal())
        }
    }

    const changeBackgroundColor = color => {
        dispatch(uiSliceActions.changeTheme({ ...theme, backgroundColor: color }))
        localStorage.setItem("theme", JSON.stringify({ ...theme, backgroundColor: color }))
    }

    const changePrimaryColor = color => {
        dispatch(uiSliceActions.changeTheme({ ...theme, primaryColor: color }))
        localStorage.setItem("theme", JSON.stringify({ ...theme, primaryColor: color }))
    }


    return (
        <section className="theme" onClick={e => closeThemeModal(e)}>
            <div className="theme__container">
                <article className="theme__primary">
                    <h3>Primary Colors</h3>
                    <ul>
                        <li onClick={() => changePrimaryColor("red")}></li>
                        <li onClick={() => changePrimaryColor("blue")}></li>
                        <li onClick={() => changePrimaryColor("yellow")}></li>
                        <li onClick={() => changePrimaryColor("green")}></li>
                        <li onClick={() => changePrimaryColor("purple")}></li>
                    </ul>
                </article>

                <article className="theme__background">
                    <h3>Background Colors</h3>
                    <ul>
                        <li onClick={() => changeBackgroundColor("")}></li>
                        <li onClick={() => changeBackgroundColor("dark")}></li>
                    </ul>
                </article>

            </div>
        </section>
    )
}

export default ThemeModal