import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, } from 'react';
import { StyleSheet, Text, View, Button, TextInput, ActivityIndicator } from 'react-native';

import { Picker } from '@react-native-picker/picker';

import Mobbex from '@mobbex/sdk';

export default function App() {
  let detectDefer;

  // Mobbex Vars
  const mobbexIntentToken = "tu intent token";
  const mobbexPublicKey = "tu llave publica";

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardholderIdentification, setCardholderIdentification] = useState("");
  const [cardExp, setCardExp] = useState("");

  const [cardSecurityCode, setCardSecurityCode] = useState("");

  const [selectedInstallment, setSelectedInstallment] = useState("");

  const [detectedInstallments, setDetectedInstallments] = useState([]);

  const [cardExpError, setCardExpError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    Mobbex.setPublicKey(mobbexPublicKey);
    Mobbex.card.init(mobbexIntentToken);
  });

  const changeCardNumber = async (cn) => {
    await setCardNumber(cn);

    // Do not detect if length is < 6
    if (cn && cn.length >= 6) {
      // Create a Defer to avoid calling mobbex hundred of times
      if (!!detectDefer) {
        clearTimeout(detectDefer);
      }

      detectDefer = setTimeout(async () => {
        // Execute Mobbex Card Detec
        const { result, data } = await Mobbex.card.detect(cn.substring(0, 6), {
          installments: true
        });

        console.info(data);
        if (!!data) {
          setDetectedInstallments(data.installments);
        }
      }, 100);
    }
  };

  const changeCardExp = (value) => {
    // console.info(value);

    setCardExp(value);

    const dateRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const dateParts = value.split('\/');
    const curDate = new Date();

    if (value.length < 3) {
      setCardExpError(null);

      return;
    }

    if (value.length < 5) {
      console.info('INCOMPLETE_DATE');

      setCardExpError("Fecha Incompleta");
    } else if (!dateRegex.test(value)) {
      console.log('INVALID_DATE');

      setCardExpError("Fecha Inválida");
    } else {
      const month = dateParts[0];
      const year = dateParts[1];

      // Valdate if its expired
      const curMonth = curDate.getMonth(),
        curYear = curDate.getFullYear();

      if (parseInt(`20${year}`) <= curYear || parseInt(month) < (curMonth + 1) && parseInt(`20${year}`) <= curYear) {
        // this.onError && this.onError({ type: "expiration", error: "EXPIRATION:EXPIRED" });
        console.log('EXPIRED');

        setCardExpError("Tarjeta Vencida");
      } else {
        // Just keep it because is OK
        console.info('DATE OK');

        setCardExpError(null);
      }
    }
  }

  const processPayment = async () => {
    await setIsLoading(true);

    try {

      const exp = cardExp.split('\/');

      // Create Card Temporary Token
      const tokenResponse = await Mobbex.card.createToken({
        card: {
          number: cardNumber,
          month: exp[0],
          year: exp[1],
          name: cardholderName,
          identification: cardholderIdentification,
          securityCode: cardSecurityCode
        }
      });

      if (!tokenResponse || tokenResponse.result === false || !tokenResponse.data) {
        setIsLoading(false);
        // this.onError && this.onError({ type: "operation", error: token.error });
        console.error('Token Failed', tokenResponse.error);
        setErrorMessage("Fallo la creación del token");
        return;
      }

      // Process the Transaction on Mobbex
      const response = await Mobbex.operation.process({
        intentToken: mobbexIntentToken,
        source: tokenResponse.data.token,
        installment: selectedInstallment,
      });

      // Save on Wallet
      // const response = await Mobbex.operation.process({
      //   intentToken: mobbexIntentToken,
      //   source: tokenResponse.data.token,
      //   installment: selectedInstallment,
      //   wallet: true
      // });

      // Change Source on Subscription
      // const subsResponse = await Mobbex.subscription.changeSource({
      //   subscription: "",
      //   subscriber: "",
      //   priority: "primary"
      // }, tokenResponse.data.token);

      setIsLoading(false);

      if (response.result === false && response.error) {
        // this.onError && this.onError({ type: "operation", error: response.error });
        console.error(response.error);

        setErrorMessage("Fallo la operación");

        return;
      } else {
        console.info(response.data);
        const { id, status } = response.data;

        setErrorMessage(`Estado del Pago: ${status.code} - ${status.text}. ID TRX: ${id}`);
      }

    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={{ marginBottom: 10 }}>Ingrese sus datos</Text>

      <View style={{ maxWidth: 500, width: "100%", alignSelf: 'center' }}>
        <View>
          <Text>Número de Tarjeta</Text>
          <TextInput
            style={styles.input}
            onChangeText={changeCardNumber}
            value={cardNumber}
            autoComplete="cc-number"
            autoCorrect={false}
            placeholder="4510 0000 0000 0001"
            keyboardType="numeric"
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text>Cuotas</Text>
          <Picker
            selectedValue={selectedInstallment}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedInstallment(itemValue)
            }>
            {(detectedInstallments ?? []).map((installment) => {
              return <Picker.Item label={installment.name} value={installment.reference} />
            })}
          </Picker>
        </View>

        <View>
          <Text>Nombre como aparece en la Tarjeta</Text>
          <TextInput
            style={styles.input}
            onChangeText={setCardholderName}
            value={cardholderName}
            autoCorrect={false}
            placeholder="Juan Perez"
          />
        </View>

        <View>
          <Text>DNI Titular</Text>
          <TextInput
            style={styles.input}
            onChangeText={setCardholderIdentification}
            value={cardholderIdentification}
            autoCorrect={false}
            placeholder="12123123"
            keyboardType="numeric"
          />
        </View>

        <View>
          <Text>Vencimiento</Text>
          <TextInput
            style={styles.input}
            onChangeText={changeCardExp}
            value={cardExp}
            autoComplete="cc-exp"
            autoCorrect={false}
            placeholder="12/24"
            keyboardType="numeric"
          />

          {cardExpError && cardExpError !== "" && (
            <Text style={{ color: "red" }}>{cardExpError}</Text>
          )}
        </View>

        <View>
          <Text>Cod Seguridad</Text>
          <TextInput
            style={styles.input}
            onChangeText={setCardSecurityCode}
            value={cardSecurityCode}
            autoComplete="cc-csc"
            autoCorrect={false}
            placeholder="123"
            keyboardType="numeric"
          />
        </View>

        {isLoading === true && (
          <ActivityIndicator style={styles.loading} size="large" />
        )}

        {errorMessage && errorMessage !== "" && (
          <Text style={{ color: "red", margin: 15, textAlign: "center", width: '100%' }}>{errorMessage}</Text>
        )}

        <Button
          onPress={processPayment}
          title="Pagar"
          style={styles.payButton}>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    placeholderTextColor: 'gray',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
  payButton: {
    backgroundColor: 'blue',
    width: '100%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 20
  },
  loading: {
    margin: 20,
    marginTop: 10
  }
});
