import { ReactNode } from 'react';

// import { Footer } from '../Footer';
import { Container } from './styles';

type IMainContentProps = { children: ReactNode };

export function MainContent({ children }: IMainContentProps) {
  return (
    <Container>
      <main>{children}</main>

      {/* <Footer /> */}
    </Container>
  );
}
