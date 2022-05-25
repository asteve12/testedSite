import Reat from "react"
import { render, screen, act, waitFor,waitForElementToBeRemoved } from '@testing-library/react';
import userEvent  from '@testing-library/user-event';

import {rest} from "msw"
import {setupServer} from "msw/node"
import App from "../App"


const server = setupServer(
  rest.get('https://dog.ceo/api/breeds/list/all', async (req, res, ctx) => {
   
    return res(
      ctx.status(200),
      ctx.json({
        message: { cattledog: [], setter: ['english', 'gordon', 'irish'] },
      })
    );  
  })
);
beforeEach(()=> server.listen())
 afterEach(()=> server.resetHandlers);
afterAll(()=> server.close())

test("check if landing is rendered",async ()=>{
    const userAction = userEvent.setup()
    render(<App></App>)

     await waitFor(() => {
    expect(screen.getAllByRole("option").length).toBe(3)
  })


  
  
 expect(screen.getByRole('heading', {name: /doggy directory 🐶/i})).toHaveTextContent(/Doggy Directory/i);
  expect(screen.getByRole('combobox', {name: /select a breed of dog to display results/i,})).toHaveDisplayValue(/select a breed/i);
  expect(screen.getByRole("img")).toBeInTheDocument()
  expect(screen.getByRole("button",{name:/Search/i})).toBeDisabled()
  screen.debug


    
})




test("should be able to search and display dog image results",async ()=>{
    const userAction = userEvent.setup();

  server.use(
    rest.get(
      'https://dog.ceo/api/breed/cattledog/images',
      async (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            message: [
              'https://images.dog.ceo/breeds/cattledog-australian/IMG_0206.jpg',
              'https://images.dog.ceo/breeds/cattledog-australian/IMG_1042.jpg',
            ],
          })
        );
      }
    )
  );

  render(<App></App>)
      const select = screen.getByRole('combobox');
      expect(await screen.findByRole('option', { name: 'cattledog' })).toBeInTheDocument();
      await userAction.selectOptions(select, 'cattledog');
      expect(select).toHaveValue('cattledog');
  const searchBtn = screen.getByRole("button",{name:/search/i});
  expect(searchBtn).not.toBeDisabled();
  await userAction.click(searchBtn);

  await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i))
   const dogImages = screen.getAllByRole('img');
   expect(dogImages).toHaveLength(2);
   expect(screen.getByText(/2 Results/i)).toBeInTheDocument();
   expect(dogImages[0]).toHaveAccessibleName('cattledog 1 of 2');
   expect(dogImages[1]).toHaveAccessibleName('cattledog 2 of 2');
} )


