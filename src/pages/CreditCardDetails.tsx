import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard as CreditCardIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { supabase } from "../integrations/supabase/client";
import { Transaction } from "../types/transaction";
import { CreditCard } from "../types/creditCard";
import { useAuth } from "../lib/auth";

import styled from "styled-components";

interface CreditCardDisplayProps {
    type: string;
    expiryDate: string;
}

const StyledWrapper = styled.div`
  .flip-card {
    background-color: transparent;
    width: 240px;
    height: 154px;
    perspective: 1000px;
    color: white;
  }

  .heading_8264 {
    position: absolute;
    letter-spacing: .2em;
    font-size: 0.5em;
    top: 2em;
    left: 18.6em;
  }

  .logo {
    position: absolute;
    top: 6.8em;
    left: 11.7em;
  }

  .chip {
    position: absolute;
    top: 2.3em;
    left: 1.5em;
  }

  .contactless {
    position: absolute;
    top: 3.5em;
    left: 12.4em;
  }

  .number {
    position: absolute;
    font-weight: bold;
    font-size: .6em;
    top: 8.3em;
    left: 1.6em;
  }

  .valid_thru {
    position: absolute;
    font-weight: bold;
    top: 635.8em;
    font-size: .01em;
    left: 140.3em;
  }

  .date_8264 {
    position: absolute;
    font-weight: bold;
    font-size: 0.5em;
    top: 13.6em;
    left: 3.2em;
  }

  .name {
    position: absolute;
    font-weight: bold;
    font-size: 0.5em;
    top: 16.1em;
    left: 2em;
  }

  .strip {
    position: absolute;
    background-color: black;
    width: 15em;
    height: 1.5em;
    top: 2.4em;
    background: repeating-linear-gradient(
      45deg,
      #303030,
      #303030 10px,
      #202020 10px,
      #202020 20px
    );
  }

  .mstrip {
    position: absolute;
    background-color: rgb(255, 255, 255);
    width: 8em;
    height: 0.8em;
    top: 5em;
    left: .8em;
    border-radius: 2.5px;
  }

  .sstrip {
    position: absolute;
    background-color: rgb(255, 255, 255);
    width: 4.1em;
    height: 0.8em;
    top: 5em;
    left: 10em;
    border-radius: 2.5px;
  }

  .code {
    font-weight: bold;
    text-align: center;
    margin: .2em;
    color: black;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    box-shadow: 0 8px 14px 0 rgba(0,0,0,0.2);
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 1rem;
  }

  .flip-card-front {
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset;
    background-color: #171717;
  }

  .flip-card-back {
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset;
    background-color: #171717;
    transform: rotateY(180deg);
  }`;


const CreditCardDisplay = ({ }: CreditCardDisplayProps) => (
    <StyledWrapper>
        <div className="flip-card">
            <div className="flip-card-inner">
                <div className="flip-card-front">
                    <p className="heading_8264">MASTERCARD</p>
                    <svg className="logo" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={36} height={36} viewBox="0 0 48 48">
                        <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z" /><path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z" /><path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z" />
                    </svg>
                    <svg version="1.1" className="chip" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="30px" height="30px" viewBox="0 0 50 50" xmlSpace="preserve">  <image id="image0" width={50} height={50} x={0} y={0} href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAACBjSFJN
              AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB6VBMVEUAAACNcTiVeUKVeUOY
              fEaafEeUeUSYfEWZfEaykleyklaXe0SWekSZZjOYfEWYe0WXfUWXe0WcgEicfkiXe0SVekSXekSW
              ekKYe0a9nF67m12ZfUWUeEaXfESVekOdgEmVeUWWekSniU+VeUKVeUOrjFKYfEWliE6WeESZe0GS
              e0WYfES7ml2Xe0WXeESUeEOWfEWcf0eWfESXe0SXfEWYekSVeUKXfEWxklawkVaZfEWWekOUekOW
              ekSYfESZe0eXekWYfEWZe0WZe0eVeUSWeETAnmDCoWLJpmbxy4P1zoXwyoLIpWbjvXjivnjgu3bf
              u3beunWvkFWxkle/nmDivXiWekTnwXvkwHrCoWOuj1SXe0TEo2TDo2PlwHratnKZfEbQrWvPrWua
              fUfbt3PJp2agg0v0zYX0zYSfgkvKp2frxX7mwHrlv3rsxn/yzIPgvHfduXWXe0XuyIDzzISsjVO1
              lVm0lFitjVPzzIPqxX7duna0lVncuHTLqGjvyIHeuXXxyYGZfUayk1iyk1e2lln1zYTEomO2llrb
              tnOafkjFpGSbfkfZtXLhvHfkv3nqxH3mwXujhU3KqWizlFilh06khk2fgkqsjlPHpWXJp2erjVOh
              g0yWe0SliE+XekShhEvAn2D///+gx8TWAAAARnRSTlMACVCTtsRl7Pv7+vxkBab7pZv5+ZlL/UnU
              /f3SJCVe+Fx39naA9/75XSMh0/3SSkia+pil/KRj7Pr662JPkrbP7OLQ0JFOijI1MwAAAAFiS0dE
              orDd34wAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IDx2lsiuJAAACLElEQVRIx2Ng
              GAXkAUYmZhZWPICFmYkRVQcbOwenmzse4MbFzc6DpIGXj8PD04sA8PbhF+CFaxEU8iWkAQT8hEVg
              OkTF/InR4eUVICYO1SIhCRMLDAoKDvFDVhUaEhwUFAjjSUlDdMiEhcOEItzdI6OiYxA6YqODIt3d
              I2DcuDBZsBY5eVTr4xMSYcyk5BRUOXkFsBZFJTQnp6alQxgZmVloUkrKYC0qqmji2WE5EEZuWB6a
              lKoKdi35YQUQRkFYPpFaCouKIYzi6EDitJSUlsGY5RWVRGjJLyxNy4ZxqtIqqvOxaVELQwZFZdkI
              JVU1RSiSalAt6rUwUBdWG1CP6pT6gNqwOrgCdQyHNYR5YQFhDXj8MiK1IAeyN6aORiyBjByVTc0F
              qBoKWpqwRCVSgilOaY2OaUPw29qjOzqLvTAchpos47u6EZyYnngUSRwpuTe6D+6qaFQdOPNLRzOM
              1dzhRZyW+CZouHk3dWLXglFcFIflQhj9YWjJGlZcaKAVSvjyPrRQ0oQVKDAQHlYFYUwIm4gqExGm
              BSkutaVQJeomwViTJqPK6OhCy2Q9sQBk8cY0DxjTJw0lAQWK6cOKfgNhpKK7ZMpUeF3jPa28BCET
              amiEqJKM+X1gxvWXpoUjVIVPnwErw71nmpgiqiQGBjNzbgs3j1nus+fMndc+Cwm0T52/oNR9lsdC
              S24ra7Tq1cbWjpXV3sHRCb1idXZ0sGdltXNxRateRwHRAACYHutzk/2I5QAAACV0RVh0ZGF0ZTpj
              cmVhdGUAMjAyMy0wMi0xM1QwODoxNToyOSswMDowMEUnN7UAAAAldEVYdGRhdGU6bW9kaWZ5ADIw
              MjMtMDItMTNUMDg6MTU6MjkrMDA6MDA0eo8JAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAy
              LTEzVDA4OjE1OjI5KzAwOjAwY2+u1gAAAABJRU5ErkJggg==" />
                    </svg>
                    <svg version="1.1" className="contactless" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 50 50" xmlSpace="preserve">  <image id="image0" width={50} height={50} x={0} y={0} href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAABGdBTUEAALGPC/xhBQAAACBjSFJN
              AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZ
              cwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IEzgIwaKTAAADDklEQVRYw+1XS0iUURQ+f5qPyjQf
              lGRFEEFK76koKGxRbWyVVLSOgsCgwjZBJJYuKogSIoOonUK4q3U0WVBWFPZYiIE6kuArG3VGzK/F
              fPeMM/MLt99/NuHdfPd888/57jn3nvsQWWj/VcMlvMMd5KRTogqx9iCdIjUUmcGR9ImUYowyP3xN
              GQJoRLVaZ2DaZf8kyjEJALhI28ELioyiwC+Rc3QZwRYyO/DH51hQgWm6DMIh10KmD4u9O16K49it
              VoPOAmcGAWWOepXIRScAoJZ2Frro8oN+EyTT6lWkkg6msZfMSR35QTJmjU0g15tIGSJ08ZZMJkJk
              HpNZgSkyXosS13TkJpZ62mPIJvOSzC1bp8vRhhCakEk7G9/o4gmZdbpsTcKu0m63FbnBP9Qrc15z
              bkbemfgNDtEOI8NO5L5O9VYyRYgmJayZ9nPaxZrSjW4+F6Uw9yQqIiIZwhp2huQTf6OIvCZyGM6g
              DJBZbyXifJXr7FZjGXsdxADxI7HUJFB6iWvsIhFpkoiIiGTJfjJfiCuJg2ZEspq9EHGVpYgzKqwJ
              qSAOEwuJQ/pxPvE3cYltJCLdxBLiSKKIE5HxJKcTRNeadxfhDiuYw44zVs1dxKwRk/uCxIiQkxKB
              sSctRVAge9g1E15EHE6yRUaJecRxcWlukdRIbGFOSZCMWQA/iWauIP3slREHXPyliqBcrrD71Amz
              Z+rD1Mt2Yr8TZc/UR4/YtFnbijnHi3UrN9vKQ9rPaJf867ZiaqDB+czeKYmd3pNa6fuI75MiC0uX
              XSR5aEMf7s7a6r/PudVXkjFb/SsrCRfROk0Fx6+H1i9kkTGn/E1vEmt1m089fh+RKdQ5O+xNJPUi
              cUIjO0Dm7HwvErEr0YxeibL1StSh37STafE4I7zcBdRq1DiOkdmlTJVnkQTBTS7X1FYyvfO4piaI
              nKbDCDaT2anLudYXCRFsQBgAcIF2/Okwgvz5+Z4tsw118dzruvIvjhTB+HOuWy8UvovEH6beitBK
              xDyxm9MmISKCWrzB7bSlaqGlsf0FC0gMjzTg6GgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDIt
              MTNUMDg6MTk6NTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTEzVDA4OjE5
              OjU2KzAwOjAw0ssWdwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xM1QwODoxOTo1Nisw
              MDowMIXeN6gAAAAASUVORK5CYII=" />
                    </svg>
                    <p className="number">**** **** **** ****</p>
                    <p className="valid_thru">VALIDA HASTA</p>
                    <p className="date_8264">** / **</p>
                </div>
                <div className="flip-card-back">
                    <div className="strip" />
                    <div className="mstrip" />
                    <div className="sstrip">
                        <p className="code">***</p>
                    </div>
                </div>
            </div>
        </div>
    </StyledWrapper>
);

const CreditCardDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [newDebt, setNewDebt] = useState("0");
    const [card, setCard] = useState<CreditCard | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!id || !user) return;

        const fetchCardDetails = async () => {
            try {
                const { data: cardData, error: cardError } = await supabase
                    .from("credit_cards")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (cardError) throw cardError;
                setCard(cardData);

                const { data: transactionData, error: transactionError } = await supabase
                    .from("transactions")
                    .select("*")
                    .eq("credit_card_id", id)
                    .order("date", { ascending: false });

                if (transactionError) throw transactionError;
                setTransactions(transactionData);
            } catch (error) {
                console.error("Error fetching card details:", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los detalles de la tarjeta",
                    variant: "destructive",
                });
            }
        };

        fetchCardDetails();
    }, [id, user]);

    const handleDebtAdjust = async () => {
        if (!card || !user) return;

        if (isAdjusting) {
            try {
                const { error } = await supabase
                    .from("credit_cards")
                    .update({ current_balance: Number(newDebt) })
                    .eq("id", card.id);

                if (error) throw error;

                toast({
                    title: "Saldo actualizado",
                    description: "El saldo de la tarjeta ha sido actualizado exitosamente.",
                });
                setCard({ ...card, current_balance: Number(newDebt) });
            } catch (error) {
                console.error("Error updating balance:", error);
                toast({
                    title: "Error",
                    description: "No se pudo actualizar el saldo",
                    variant: "destructive",
                });
            }
        }
        setIsAdjusting(!isAdjusting);
    };

    if (!card) {
        return (
            <div className="p-6">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                    <ArrowLeft className="mr-2" />
                    Volver al Dashboard
                </Button>
                <p>Tarjeta no encontrada</p>
            </div>
        );
    }

    const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPayments = transactions
        .filter(t => t.type === "credit_payment")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="p-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                <ArrowLeft className="mr-2" />
                Volver al Dashboard
            </Button>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{card.name}</span>
                            <Button
                                variant={isAdjusting ? "default" : "outline"}
                                onClick={handleDebtAdjust}
                            >
                                {isAdjusting ? "Guardar" : "Reajustar"}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <CreditCardDisplay
                                type="visa"
                                expiryDate={`${card.cutoff_day}/${new Date().getFullYear()}`}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <CreditCardIcon className="h-5 w-5 text-muted-foreground" />
                            {isAdjusting ? (
                                <Input
                                    type="number"
                                    value={newDebt}
                                    onChange={(e) => setNewDebt(e.target.value)}
                                    className="max-w-[200px]"
                                />
                            ) : (
                                <span className="text-2xl font-bold">
                                    ${(card.current_balance ?? 0).toLocaleString("es-ES")}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Tarjeta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Límite de Crédito</dt>
                                    <dd className="font-medium">${card.limit_amount.toLocaleString("es-ES")}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Crédito Disponible</dt>
                                    <dd className="font-medium">${(card.limit_amount - (card.current_balance ?? 0)).toLocaleString("es-ES")}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Fecha de Corte</dt>
                                    <dd className="font-medium">Día {card.cutoff_day}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Fecha de Pago</dt>
                                    <dd className="font-medium">Día {card.payment_day}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Fecha de Creación</dt>
                                    <dd className="font-medium">{new Date(card.created_at).toLocaleDateString()}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Movimientos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Gastos</span>
                                    <span className="font-medium text-destructive">
                                        ${totalExpenses.toLocaleString("es-ES")}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Pagos</span>
                                    <span className="font-medium text-green-600">
                                        ${totalPayments.toLocaleString("es-ES")}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="font-medium">Total Transacciones</span>
                                    <span className="font-medium">{transactions.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Transacciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex justify-between items-center border-b pb-2"
                                >
                                    <div>
                                        <p className="font-semibold">{transaction.description}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={
                                            transaction.type === "credit_payment"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }
                                    >
                                        {transaction.type === "credit_payment" ? "+" : "-"}$
                                        {transaction.amount.toLocaleString("es-ES")}
                                    </span>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <p className="text-center text-muted-foreground">
                                    No hay transacciones para mostrar
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreditCardDetails;