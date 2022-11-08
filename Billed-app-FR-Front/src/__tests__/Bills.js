/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import { cleanup } from '@testing-library/dom'
import BillsUI from "../views/BillsUI.js"
import {billUrl}  from "../views/Actions.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  
  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      //to-do write expect expression
      expect(windowIcon.className).toBe(`active-icon`)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    
    test('Then It should render a modal on click on Eye', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      document.body.innerHTML = BillsUI({data: bills})
      const bills2 = new Bills({
        document,onNavigate,localStorage: window.localStorage
      });
      const handleClickIconEye = jest.fn((icon) => bills2.handleClickIconEye(icon))
      const modaleFile = document.getElementById('modaleFile')
      const iconEye = screen.getAllByTestId("icon-eye");
      
      
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))
      iconEye.forEach(icon => {
        icon.addEventListener("click", handleClickIconEye(icon))
        fireEvent.click(icon)
        expect(modaleFile.className).toBe('modal fade show')
      })
      })
    
  
      describe("when i click on a new bill creation", () =>{
        test("Then it should render to a form", () => {
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({pathname})
          }
          const bills = new Bills({
            document,onNavigate,localStorage: window.localStorage
          });
          const handleClickNewBil = jest.fn(() => bills.handleClickNewBill())
          const addNewBill = screen.getByTestId("btn-new-bill")
          addNewBill.addEventListener("click", handleClickNewBil)
          fireEvent.click(addNewBill)
          expect(handleClickNewBil).toHaveBeenCalled()
          expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy()
        
        })
      })

      ////GET///
      describe('When i navigate on bills page', () => {
        test('fetches bills from mock API GET ', async () => {
          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
  
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }
  
        const mockBills = new Bills({
          document,
          onNavigate,
          store:mockStore,
          localStorage: window.localStorage
        })
  
        const bills = await mockBills.getBills();
        expect(bills.length!=0).toBeTruthy();
      })
      //Ajout du CATCH // 
      })
        
      })
      })
  

