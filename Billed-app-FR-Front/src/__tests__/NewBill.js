/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import { cleanup } from '@testing-library/dom'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";





describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test('Then mail icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.className).toBe("active-icon")
    })
  })
    describe("When i click to upload a file", () => {
      test("Then handlechangefile function is call and check the file", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }
        document.body.innerHTML = NewBillUI()
        const newbill = new NewBill({
          document,
          store:mockStore,
          onNavigate,
          localStorage: window.localStorage
        });
        const handleChangeFile = jest.fn( newbill.handleChangeFile);
        const btn = screen.getByTestId("file");
        btn.addEventListener('change', handleChangeFile);
        fireEvent.change(btn, {
          target : {
            files: [new File
              (["test.jpg"], 'test.jpg', {type:'image/jpg'})]
        }
        })
        expect(handleChangeFile).toHaveBeenCalled();
        expect(btn.files[0].name).toBe('test.jpg');
        
      })
    })
})

describe("Given i'm an user connected as an employee",  () =>{
 describe("When i add a new bill to the server", () => {
  test('Then the server should  save the new Bill', async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()

    const onNavigate = jest.fn((pathname) => {
      document.body.innerHTML = ROUTES({pathname})
    })

    document.body.innerHTML = NewBillUI();

    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage
    })

    const buttonSendBill = screen.getByTestId('form-new-bill')
    const handleSubmit = jest.fn(newBill.handleSubmit)
    buttonSendBill.addEventListener('submit', handleSubmit)
    fireEvent.submit(buttonSendBill)
    expect(handleSubmit).toHaveBeenCalled()
  })
})


describe('When an error occurs on API', () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")

    window.localStorage.setItem('user' , JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })
  
  test('fetches bills from an API and fails with 404 message error', async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 404"))
        }
      }})
    window.onNavigate(ROUTES_PATH.Bills);
    document.body.innerHTML = BillsUI({ error: "Erreur 404" });
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })

  test('fetches messages from an API and fails with 500 message error', async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      }})

    window.onNavigate(ROUTES_PATH.Bills);
    document.body.innerHTML = BillsUI({ error: "Erreur 500" });
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })  
 }) 
})
