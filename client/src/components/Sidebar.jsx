import React from 'react'
import { NavLink } from 'react-router-dom'
import { AiOutlineHome } from 'react-icons/ai';
import { GoMail } from "react-icons/go";
import { FaRegBookmark } from "react-icons/fa";
import { PiPaintBrushBold } from "react-icons/pi";
import { MdGroups } from "react-icons/md";
import { useDispatch } from 'react-redux';
import { uiSliceActions } from '../store/ui-slice';


const Sidebar = () => {

  const dispatch = useDispatch()

  const openThemeModal = () => {
    dispatch(uiSliceActions.openThemeModal())
  }

  return (
    <menu className="sidebar">
      <NavLink to="/" end className={({ isActive }) =>
        `sidebar__item ${isActive ? "active" : ""}`
      }>
        <i className='sidebar__icon'><AiOutlineHome /></i>
        <p>Home</p>
      </NavLink>

      <NavLink to="/messages" className={({ isActive }) =>
        `sidebar__item ${isActive ? "active" : ""}`
      }>
        <i className='sidebar__icon'><GoMail /></i>
        <p>Messages</p>
      </NavLink>

      <NavLink to="/groups" className={({ isActive }) =>
        `sidebar__item ${isActive ? "active" : ""}`
      }>
        <i className='sidebar__icon'><MdGroups /></i>
        <p>Groups</p>
      </NavLink>

      <a className="sidebar__item" onClick={openThemeModal}>
        <i className='sidebar__icon'><PiPaintBrushBold /></i>
        <p>Themes</p>
      </a>
    </menu>
  )
}

export default Sidebar